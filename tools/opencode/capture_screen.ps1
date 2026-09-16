<#
.SYNOPSIS
    Captura de pantalla de escritorio de ultra alto rendimiento para OpenCode Web y Agentes IA.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$OutPath = "",

    [Parameter(Mandatory=$false)]
    [int]$MaxHistory = 5,

    [Parameter(Mandatory=$false)]
    [switch]$Json,

    [Parameter(Mandatory=$false)]
    [switch]$Base64
)

$ErrorActionPreference = "Stop"

$csharpCode = @"
using System;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.IO;

public class OpenCodeScreenCapture {
    [DllImport("user32.dll")]
    public static extern bool SetProcessDPIAware();

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenWindowStation(string lpszWinSta, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetProcessWindowStation(IntPtr hWinSta);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetThreadDesktop(IntPtr hDesktop);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool CloseDesktop(IntPtr hDesktop);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool CloseWindowStation(IntPtr hWinSta);

    [DllImport("user32.dll")]
    public static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("user32.dll")]
    public static extern int GetSystemMetrics(int nIndex);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern IntPtr CreateCompatibleDC(IntPtr hdc);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int nWidth, int nHeight);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern IntPtr SelectObject(IntPtr hdc, IntPtr hgdiobj);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool BitBlt(IntPtr hdcDest, int nXDest, int nYDest, int nWidth, int nHeight, IntPtr hdcSrc, int nXSrc, int nYSrc, int dwRop);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool DeleteDC(IntPtr hdc);

    [DllImport("gdi32.dll", SetLastError = true)]
    public static extern bool DeleteObject(IntPtr hObject);

    const int SM_XVIRTUALSCREEN = 76;
    const int SM_YVIRTUALSCREEN = 77;
    const int SM_CXVIRTUALSCREEN = 78;
    const int SM_CYVIRTUALSCREEN = 79;
    const int SRCCOPY = 0x00CC0020;

    public class CaptureResult {
        public bool Success;
        public string Path;
        public int Width;
        public int Height;
        public long SizeBytes;
        public string Error;
        public string Timestamp;
    }

    public static CaptureResult TakeScreenshot(string destPath) {
        CaptureResult result = new CaptureResult();
        result.Timestamp = DateTime.UtcNow.ToString("o");
        try {
            SetProcessDPIAware();
        } catch {}

        Thread worker = new Thread(() => {
            IntPtr hWinsta = IntPtr.Zero;
            IntPtr hDesk = IntPtr.Zero;
            try {
                hWinsta = OpenWindowStation("WinSta0", false, 0x037F);
                if (hWinsta != IntPtr.Zero) SetProcessWindowStation(hWinsta);
                hDesk = OpenDesktop("default", 0, false, 0x01FF);
                if (hDesk != IntPtr.Zero) SetThreadDesktop(hDesk);
            } catch {}

            int x = GetSystemMetrics(SM_XVIRTUALSCREEN);
            int y = GetSystemMetrics(SM_YVIRTUALSCREEN);
            int width = GetSystemMetrics(SM_CXVIRTUALSCREEN);
            int height = GetSystemMetrics(SM_CYVIRTUALSCREEN);

            if (width <= 0 || height <= 0) {
                x = 0;
                y = 0;
                width = GetSystemMetrics(0);
                height = GetSystemMetrics(1);
            }

            IntPtr hdcSrc = GetDC(IntPtr.Zero);
            IntPtr hdcDest = CreateCompatibleDC(hdcSrc);
            IntPtr hBitmap = CreateCompatibleBitmap(hdcSrc, width, height);
            IntPtr hOld = SelectObject(hdcDest, hBitmap);
            bool res = BitBlt(hdcDest, 0, 0, width, height, hdcSrc, x, y, SRCCOPY);
            int bitBltErr = Marshal.GetLastWin32Error();

            SelectObject(hdcDest, hOld);
            DeleteDC(hdcDest);
            ReleaseDC(IntPtr.Zero, hdcSrc);

            if (hDesk != IntPtr.Zero) CloseDesktop(hDesk);
            if (hWinsta != IntPtr.Zero) CloseWindowStation(hWinsta);

            if (!res) {
                DeleteObject(hBitmap);
                result.Success = false;
                result.Error = "BitBlt failed (Win32 error: " + bitBltErr + ")";
                return;
            }

            string dir = Path.GetDirectoryName(destPath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) {
                Directory.CreateDirectory(dir);
            }

            Bitmap img = Image.FromHbitmap(hBitmap);
            DeleteObject(hBitmap);
            img.Save(destPath, ImageFormat.Png);
            FileInfo fi = new FileInfo(destPath);
            long len = fi.Length;
            img.Dispose();

            result.Success = true;
            result.Path = destPath;
            result.Width = width;
            result.Height = height;
            result.SizeBytes = len;
        });

        worker.SetApartmentState(ApartmentState.STA);
        worker.Start();
        worker.Join();
        return result;
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'OpenCodeScreenCapture').Type) {
    Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing
}

$cacheDir = "C:\Users\pepde\.config\opencode\cache\screenshots"
if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
}

if ([string]::IsNullOrWhiteSpace($OutPath)) {
    $timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $OutPath = Join-Path $cacheDir "screenshot_$timestamp.png"
} else {
    $parentDir = Split-Path -Parent $OutPath
    if ($parentDir -and -not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
}

$capResult = [OpenCodeScreenCapture]::TakeScreenshot($OutPath)

try {
    $files = Get-ChildItem -Path $cacheDir -Filter "*.png" | Sort-Object CreationTime -Descending
    if ($files.Count -gt $MaxHistory) {
        $files | Select-Object -Skip $MaxHistory | Remove-Item -Force -ErrorAction SilentlyContinue
    }
} catch {}

$b64String = ""
if ($Base64 -and $capResult.Success -and (Test-Path $capResult.Path)) {
    $bytes = [System.IO.File]::ReadAllBytes($capResult.Path)
    $b64String = [Convert]::ToBase64String($bytes)
}

if ($Json) {
    $response = [PSCustomObject]@{
        success    = $capResult.Success
        path       = $capResult.Path
        width      = $capResult.Width
        height     = $capResult.Height
        size_bytes = $capResult.SizeBytes
        timestamp  = $capResult.Timestamp
        error      = $capResult.Error
    }
    if ($Base64) {
        $response | Add-Member -MemberType NoteProperty -Name "base64" -Value $b64String
    }
    $response | ConvertTo-Json -Compress
} else {
    if ($capResult.Success) {
        Write-Host "[SCREENSHOT_OK] Ruta: $($capResult.Path)" -ForegroundColor Green
        Write-Host "   Resolucion: $($capResult.Width)x$($capResult.Height)"
        Write-Host "   Tamano: $([math]::Round($capResult.SizeBytes / 1KB, 2)) KB"
        Write-Host "   Timestamp: $($capResult.Timestamp)"
    } else {
        Write-Error "[SCREENSHOT_ERROR] $($capResult.Error)"
    }
}
