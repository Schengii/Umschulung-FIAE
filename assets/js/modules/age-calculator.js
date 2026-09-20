/**
 * Age Calculator Module — Dynamic age calculation from birth date
 * Replaces inline script from home.html
 */
export function calculateAge(birthYear, birthMonth, birthDay, today = new Date()) {
    let age = today.getFullYear() - birthYear;
    if (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
        age--;
    }
    return age;
}

export function initAgeCalculator() {
    const age = calculateAge(2002, 5, 10);
    const els = document.querySelectorAll('#my-age, #my-age-en, #my-age-de');
    els.forEach((el) => {
        if (el) el.textContent = age;
    });
}
