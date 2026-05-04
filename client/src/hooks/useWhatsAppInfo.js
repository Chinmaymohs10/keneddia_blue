import { useQuery } from "@tanstack/react-query";
import { getAllWhatsAppInfo } from "@/Api/utilsApi";
import { getPropertyTypes } from "@/Api/Api";

/**
 * Resolves the active WhatsApp entry for a given context.
 * Priority: propertyId match > propertyTypeId/propertyTypeName match > main (no ids)
 *
 * @param {object} options
 * @param {number|string} [options.propertyId]        - specific property id
 * @param {number|string} [options.propertyTypeId]    - specific property type id
 * @param {string}        [options.propertyTypeName]  - property type name (e.g. "Wine", "Restaurant")
 * @returns {{ info: object|null, phoneNumber: string|null, loading: boolean }}
 */
export function useWhatsAppInfo({ propertyId, propertyTypeId, propertyTypeName } = {}) {
  const { data: allInfos = [], isLoading: loadingInfos } = useQuery({
    queryKey: ["whatsapp-info"],
    queryFn: async () => {
      const res = await getAllWhatsAppInfo();
      const data = res?.data?.data || res?.data || res || [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const needsTypeResolution = !!propertyTypeName && !propertyTypeId;

  const { data: propertyTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["property-types"],
    queryFn: async () => {
      const res = await getPropertyTypes();
      const data = res?.data?.data || res?.data || res || [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 60,
    enabled: needsTypeResolution,
  });

  const loading = loadingInfos || (needsTypeResolution && loadingTypes);

  let resolvedTypeId = propertyTypeId ? Number(propertyTypeId) : null;
  if (!resolvedTypeId && propertyTypeName && propertyTypes.length > 0) {
    const match = propertyTypes.find(
      (pt) => (pt.typeName || pt.name || "").toLowerCase() === propertyTypeName.toLowerCase()
    );
    if (match) resolvedTypeId = match.id;
  }

  const activeInfos = allInfos.filter((i) => i.active);

  let info = null;

  if (propertyId) {
    info = activeInfos.find((i) => Number(i.propertyId) === Number(propertyId)) ?? null;
  }

  if (!info && resolvedTypeId) {
    info = activeInfos.find((i) => Number(i.propertyTypeId) === resolvedTypeId && !i.propertyId) ?? null;
  }

  if (!info && !propertyId && !resolvedTypeId) {
    info = activeInfos.find((i) => !i.propertyId && !i.propertyTypeId) ?? null;
  }

  return {
    info,
    phoneNumber: info?.phoneNumber ?? null,
    loading,
  };
}
