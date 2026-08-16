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
    const limitKV_PV = 5175; // Kranken- und Pflegeversicherung
    const limitRV_AV = 7450; // Renten- und Arbeitslosenversicherung
    
    const socialRates = {
        health: 0.081,
        care: hasChildren ? 0.017 : 0.022,
        pension: 0.046,
        unemp: 0.013
    };
    
    const basisKV_PV = Math.min(grossMonthly, limitKV_PV);
    const basisRV_AV = Math.min(grossMonthly, limitRV_AV);
    
    const socialMonthly = (basisKV_PV * (socialRates.health + socialRates.care)) +
                          (basisRV_AV * (socialRates.pension + socialRates.unemp));
                          
    // --- 2. Einkommensteuer (Deutscher progressiver Tarif) ---
    const standardDeductions = 1266;
    const socialDeductionsYearly = socialMonthly * 12 * 0.96;
    
    const taxableYearly = Math.max(0, grossYearly - socialDeductionsYearly - standardDeductions);
    
    let basicAllowance = 11784;
    if (taxClass === 2) basicAllowance = 16044;
    else if (taxClass === 3) basicAllowance = 23568;
    else if (taxClass === 5 || taxClass === 6) basicAllowance = 0;
    
    let taxYearly = 0;
    const scaleFactor = basicAllowance / 11784;
    
    if (scaleFactor === 0) {
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

/**
 * Berechnet das gesamte Vergütungspaket (Total Compensation / Total Comp)
 * inklusive Boni, Aktien/ESOP, Dienstwagen, Homeoffice-Zuschuss und 13. Gehalt.
 */
export function calculateTotalCompensation(job, settings = {}) {
    const baseSalary = parseFloat(job.salary) || 0;
    const bonus = parseFloat(job.bonus) || 0;
    const stockOptions = parseFloat(job.stockOptions) || 0;
    const perksValue = parseFloat(job.perksValue) || 0; // Dienstwagen, Ticket, HO-Zuschuss
    const month13 = job.has13thSalary ? (baseSalary / 12) : 0;

    const totalGrossYearly = baseSalary + bonus + stockOptions + perksValue + month13;
    const netCalc = calculateGermanNetSalary(totalGrossYearly, settings);

    return {
        baseSalary,
        bonus,
        stockOptions,
        perksValue,
        month13,
        totalGrossYearly: Math.round(totalGrossYearly),
        totalNetYearly: netCalc.netYearly,
        totalNetMonthly: netCalc.netMonthly
    };
}

/**
 * Berechnet den effektiven Netto-Stundenlohn pro geleisteter Lebensstunde
 * unter Berücksichtigung von Wochenarbeitszeit und wöchentlicher Pendelzeit.
 */
export function calculateNetHourlyRate(totalNetYearly, weeklyHours = 40, commuteHoursPerWeek = 0) {
    const totalWeeklyHours = (parseFloat(weeklyHours) || 40) + (parseFloat(commuteHoursPerWeek) || 0);
    const yearlyWorkHours = totalWeeklyHours * 52;
    
    if (yearlyWorkHours <= 0) return 0;
    const hourlyNet = totalNetYearly / yearlyWorkHours;
    return Math.round(hourlyNet * 100) / 100;
}

/**
 * Berechnet die steuerlich absetzbaren Reisekosten für Vorstellungsgespräche
 * inklusive Entfernungspauschale (0,30 € / km) und gesetzlichem Verpflegungsmehraufwand (14 € / 28 €).
 * 
 * @param {number} distanceKm - Einfache oder Hin-/Rückfahrt-Distanz in km
 * @param {number} durationHours - Dauer der Abwesenheit von der Wohnung in Stunden
 * @param {number} hotelExpenses - Tatsächliche Übernachtungskosten
 * @returns {Object} Aufschlüsselung der abzugsfähigen Reisekosten
 */
export function calculateTravelAndMealAllowance(distanceKm = 0, durationHours = 0, hotelExpenses = 0) {
    const km = Math.max(0, parseFloat(distanceKm) || 0);
    const hours = Math.max(0, parseFloat(durationHours) || 0);
    const hotel = Math.max(0, parseFloat(hotelExpenses) || 0);

    // Fahrtkosten: 0,30 € pro gefahrenem Kilometer (Hin- und Rückfahrt)
    const travelCost = km * 2 * 0.30;

    // Verpflegungsmehraufwand (deutsche Pauschale):
    // > 8 Stunden Abwesenheit: 14 €
    // Ganztägig (24 Stunden): 28 €
    let mealAllowance = 0;
    if (hours >= 24) {
        mealAllowance = 28;
    } else if (hours >= 8) {
        mealAllowance = 14;
    }

    const totalDeductible = travelCost + mealAllowance + hotel;

    return {
        travelCost: Math.round(travelCost * 100) / 100,
        mealAllowance: mealAllowance,
        hotelExpenses: hotel,
        totalDeductible: Math.round(totalDeductible * 100) / 100
    };
}

