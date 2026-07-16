export function resolveAccountStatus({ status, pendingAmount, completeAmount }) {
    const normalizedStatus = String(status || '').trim().toUpperCase();
    const parsedPending = Number.parseFloat(pendingAmount ?? 0);
    const parsedComplete = Number.parseFloat(completeAmount ?? 0);

    if (Number.isFinite(parsedComplete) && parsedComplete > 0 && parsedPending >= parsedComplete) {
        return 'COMPLETE';
    }

    if (normalizedStatus === 'RECEIPT') {
        return normalizedStatus;
    }

    return normalizedStatus || 'RECEIPT';
}
