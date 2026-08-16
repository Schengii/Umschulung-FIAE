/**
 * Tax Export Utility for JobMatch
 * Formats job search expenses into CSV and structured PDF reports for German Income Tax (Anlage N / Werbungskosten).
 */

export const taxExport = {
    /**
     * Generates a CSV string representing all tax deductible job search expenses.
     * @param {Array} expenses - List of expense objects
     * @returns {string} CSV formatted content
     */
    generateCsv(expenses = []) {
        const headers = ['Datum', 'Kategorie', 'Beschreibung', 'Betrag (EUR)', 'Job / Firma', 'Kilometer (Entfernung)', 'Pauschale / Einzelnachweis'];
        const rows = expenses.map(exp => {
            const dateStr = exp.date || new Date().toISOString().split('T')[0];
            const catStr = exp.category || 'Sonstiges';
            const descStr = `"${(exp.description || '').replace(/"/g, '""')}"`;
            const amountStr = (exp.amount || 0).toFixed(2).replace('.', ',');
            const jobStr = `"${(exp.jobTitle || exp.company || '').replace(/"/g, '""')}"`;
            const kmStr = exp.kilometers || 0;
            const typeStr = exp.isFlatRate ? 'Pauschale' : 'Einzelnachweis';
            return [dateStr, catStr, descStr, amountStr, jobStr, kmStr, typeStr].join(';');
        });

        return [headers.join(';'), ...rows].join('\n');
    },

    /**
     * Triggers a download of the CSV tax report.
     * @param {Array} expenses 
     */
    downloadCsv(expenses = []) {
        const csvContent = '\uFEFF' + this.generateCsv(expenses); // Add UTF-8 BOM
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Werbungskosten_Bewerbungen_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Generates a tax summary report with calculated totals (flat rates, travel allowances).
     * @param {Array} expenses 
     * @returns {Object} Tax summary statistics
     */
    calculateTaxSummary(expenses = []) {
        let totalDirect = 0;
        let totalTravel = 0;
        let totalFlatRates = 0;
        let kmTotal = 0;

        expenses.forEach(exp => {
            const amt = Number(exp.amount) || 0;
            if (exp.category === 'Fahrtkosten' || exp.kilometers > 0) {
                const km = Number(exp.kilometers) || 0;
                kmTotal += km;
                // Standard German travel allowance: 0,30€ up to 20km, 0,38€ from 21km onwards
                const travelAllowance = km <= 20 ? km * 0.30 : (20 * 0.30) + ((km - 20) * 0.38);
                totalTravel += amt > 0 ? amt : travelAllowance;
            } else if (exp.isFlatRate) {
                totalFlatRates += amt;
            } else {
                totalDirect += amt;
            }
        });

        const grandTotal = totalDirect + totalTravel + totalFlatRates;

        return {
            totalDirect: totalDirect.toFixed(2),
            totalTravel: totalTravel.toFixed(2),
            totalFlatRates: totalFlatRates.toFixed(2),
            kmTotal,
            grandTotal: grandTotal.toFixed(2),
            itemCount: expenses.length
        };
    }
};
