# Check exact string matching
key1 = "Super Saiyan Tipo A (Pelo Azul / Despertar)"
key2 = "Super Saiyan Tipo A (Pelo Azul / Despertar)"

print("key1 == key2:", key1 == key2)
print("key1 bytes:", [hex(ord(c)) for c in key1])
print("key2 bytes:", [hex(ord(c)) for c in key2])

# Check if key1 in key2
print("key1 in key2:", key1 in key2)

# Check the form name from the source
form_name = "Super Saiyan Tipo A (Pelo Azul / Despertar)"
print("form_name:", form_name)
print("key in form_name:", "Super Saiyan Tipo A (Pelo Azul / Despertar)" in form_name)
print("form_name bytes:", [hex(ord(c)) for c in form_name])