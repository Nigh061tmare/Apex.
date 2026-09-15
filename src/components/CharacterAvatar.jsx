// ============================================================
// APEX — Avatar de personaje (componente único, determinista)
//
// Cierra el Módulo Visual 1.4-1.7:
//   • Resolución por cadena (forma → avatar → wiki id → wiki nombre → placeholder)
//   • Fallback onError → placeholder temático (SIN red, SIN IA, SIN robots)
//   • Lazy loading + decoding async (rendimiento en listas de 775)
//   • Reactivo a la forma activa (formId / formName)
//   • Nunca renderiza un hueco vacío: siempre hay algo pintable
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  resolveCharacterImage,
  resolveNpcImage,
  buildFranchisePlaceholder,
} from '../lib/apexImageResolver';

/**
 * @param {object}  props.character   Ficha del roster (o PNJ con `asNpc`).
 * @param {string}  [props.formId]    Id de la forma activa.
 * @param {string}  [props.formName]  Nombre de la forma activa.
 * @param {boolean} [props.asNpc]     Tratar como PNJ de campaña.
 * @param {boolean} [props.eager]     Carga inmediata (para el combate en curso).
 * @param {string}  [props.alt]       Texto alternativo.
 * @param {string}  [props.className] Clases del contenedor <span>.
 * @param {string}  [props.imgClassName] Clases del <img>.
 */
export default function CharacterAvatar({
  character,
  formId,
  formName,
  asNpc = false,
  eager = false,
  alt,
  className = '',
  imgClassName = '',
  ...rest
}) {
  const computeSrc = useCallback(() => {
    if (!character) return null;
    return asNpc
      ? resolveNpcImage(character)
      : resolveCharacterImage(character, { formId, formName });
  }, [character, formId, formName, asNpc]);

  const [src, setSrc] = useState(computeSrc);
  const [exhausted, setExhausted] = useState(false);

  // Reactivo: al cambiar el personaje o su forma activa, se recalcula.
  useEffect(() => {
    setSrc(computeSrc());
    setExhausted(false);
  }, [computeSrc]);

  const handleError = () => {
    if (exhausted) return;
    // La URL real falló (404/403/hotlink bloqueado): degradar al placeholder local.
    setExhausted(true);
    setSrc(buildFranchisePlaceholder(character || { name: alt }));
  };

  if (!character || !src) return null;

  const label = alt || character.name || character.displayName || 'Combatiente';

  return (
    <span className={`relative inline-flex items-center justify-center overflow-hidden ${className}`} {...rest}>
      <img
        src={src}
        alt={label}
        title={label}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={eager ? 'high' : undefined}
        onError={handleError}
        onErrorCapture={handleError}
        className={`w-full h-full object-contain object-center ${imgClassName}`}
      />
    </span>
  );
}
