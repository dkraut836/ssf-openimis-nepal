
export function healthFacilityLabel(hf) {
    return !!hf ? `${hf.code} ${hf.name}` : "";
}

export function locationLabel(l) {
    return !!l ? `${l.code} ${l.name}` : "";
}