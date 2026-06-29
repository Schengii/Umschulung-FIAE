/**
 * Age Calculator Module — Dynamic age calculation from birth date
 * Replaces inline script from home.html
 */
function initAgeCalculator() {
    const birthYear = 2002, birthMonth = 5, birthDay = 10;
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    if (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
        age--;
    }
    const els = document.querySelectorAll('#my-age, #my-age-en');
    els.forEach(el => { if (el) el.textContent = age; });
}
