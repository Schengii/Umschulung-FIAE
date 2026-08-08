/**
 * Berechnet eine Schätzung des deutschen Netto-Gehalts
 * basierend auf typischen Sätzen und Beitragsbemessungsgrenzen.
 * 
 * @param {number} grossYearly - Das jährliche Bruttogehalt in Euro.
 * @param {Object} [settings] - Optionale Steuereinstellungen (Steuerklasse, Kirchensteuer, Kinder)
 * @returns {Object} Das berechnete Gehaltsobjekt.
 */
export function calculateGermanNetSalary(grossYearly, settings = {}) {
    if (!grossYearly || grossYearly <= 0) {
        return {
            netYearly: 0,
            netMonthly: 0,
            socialSecurityMonthly: 0,
            taxMonthly: 0
        };
    }
    
    const taxClass = parseInt(settings.taxClass || '1', 10);
    const churchTaxRate = parseInt(settings.churchTax || '0', 10) / 100;
    const hasChildren = !!settings.hasChildren;
    
    const grossMonthly = grossYearly / 12;
    
    // --- 1. Sozialabgaben (Arbeitnehmeranteil ca. 20%) ---
    // Beitragsbemessungsgrenzen 2026 (Schätzung)
    const limitKV_PV = 5175; // Kranken- und Pflegeversicherung
    const limitRV_AV = 7450; // Renten- und Arbeitslosenversicherung
    
    // Beitragssätze Arbeitnehmeranteil (ca.)
    const socialRates = {
        health: 0.081, // Krankenversicherung (inkl. Zusatzbeitrag)
        care: hasChildren ? 0.017 : 0.022,   // Pflegeversicherung (kinderlos-Zuschlag vs. Kinder-Abschlag)
        pension: 0.046, // Rentenversicherung
        unemp: 0.013    // Arbeitslosenversicherung
    };
    
    const basisKV_PV = Math.min(grossMonthly, limitKV_PV);
    const basisRV_AV = Math.min(grossMonthly, limitRV_AV);
    
    const socialMonthly = (basisKV_PV * (socialRates.health + socialRates.care)) +
                          (basisRV_AV * (socialRates.pension + socialRates.unemp));
                          
    // --- 2. Einkommensteuer (Deutscher progressiver Tarif) ---
    // Werbungskostenpauschale (1.230 €) & Sonderausgabenpauschale (36 €)
    const standardDeductions = 1266;
    const socialDeductionsYearly = socialMonthly * 12 * 0.96; // Vorsorgeaufwendungen ca. 96% abziehbar
    
    // Zu versteuerndes Einkommen (zvE)
    const taxableYearly = Math.max(0, grossYearly - socialDeductionsYearly - standardDeductions);
    
    // Grundfreibetrag & Progressionszone anpassen je nach Steuerklasse
    let basicAllowance = 11784;
    if (taxClass === 2) basicAllowance = 16044; // Alleinerziehend
    else if (taxClass === 3) basicAllowance = 23568; // Ehegatte (verdoppelt)
    else if (taxClass === 5 || taxClass === 6) basicAllowance = 0; // Kein bzw. kaum Freibetrag
    
    let taxYearly = 0;
    const scaleFactor = basicAllowance / 11784;
    
    if (scaleFactor === 0) {
        // Steuerklasse 5 oder 6 (Sehr hohe Abzüge ab dem 1. Euro)
        taxYearly = taxableYearly * (taxClass === 6 ? 0.35 : 0.28);
    } else {
        const adjustedBracket1 = 11784 * scaleFactor;
        const adjustedBracket2 = 17000 * scaleFactor;
        const adjustedBracket3 = 66000 * scaleFactor;
        
        if (taxableYearly <= adjustedBracket1) {
            taxYearly = 0;
        } else if (taxableYearly <= adjustedBracket2) {
            const y = (taxableYearly - adjustedBracket1) / (10000 * scaleFactor);
            taxYearly = (922.3 * y + 1400) * y * scaleFactor;
        } else if (taxableYearly <= adjustedBracket3) {
            const z = (taxableYearly - adjustedBracket2) / (10000 * scaleFactor);
            taxYearly = ((181.76 * z + 2400) * z + 820) * scaleFactor;
        } else if (taxableYearly <= 277825) {
            taxYearly = 0.42 * taxableYearly - (10600 * scaleFactor);
        } else {
            taxYearly = 0.45 * taxableYearly - (18900 * scaleFactor);
        }
    }
    
    // --- 3. Solidaritätszuschlag (Soli) ---
    let soliYearly = 0;
    if (taxYearly > 18130) {
        soliYearly = taxYearly * 0.055;
    }
    
    // --- 4. Kirchensteuer ---
    const churchTaxYearly = taxYearly * churchTaxRate;
    
    const totalDeductionsYearly = (socialMonthly * 12) + taxYearly + soliYearly + churchTaxYearly;
    const netYearly = Math.max(0, grossYearly - totalDeductionsYearly);
    
    return {
        netYearly: Math.round(netYearly),
        netMonthly: Math.round(netYearly / 12),
        socialSecurityMonthly: Math.round(socialMonthly),
        taxMonthly: Math.round((taxYearly + soliYearly + churchTaxYearly) / 12)
    };
}
