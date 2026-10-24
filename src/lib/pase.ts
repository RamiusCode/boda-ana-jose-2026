// src/lib/pase.ts
// Textos de la tarjeta del pase que dependen del número de pases.
// Los usan el render del servidor (Pase.astro) y el script que pinta los
// datos que llegan de la base: un solo lugar, para que nunca se contradigan.

export function textosPase(pases: number): { etiqueta: string; frase: string } {
    // Con un solo pase se tutea al invitado; desde dos, la frase va en plural.
    const individual = pases === 1;
    return {
        etiqueta: individual ? "Pase" : "Pases",
        frase: individual
            ? "Esperamos contar con tu presencia"
            : "Esperamos contar con su presencia",
    };
}
