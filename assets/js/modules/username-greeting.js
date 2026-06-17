/**
 * Username Greeting Module — Welcome page personalization
 */
function initUsernameGreeting() {
    const mySubmit = document.getElementById('mySubmit');
    const myText = document.getElementById('myText');
    const myH1 = document.getElementById('myH1');

    if (mySubmit && myText) {
        const storedName = StorageManager.getItem(STORAGE_KEYS.USERNAME);
        if (storedName) {
            myText.value = storedName;
            updateWelcomeH1(storedName);
        }

        mySubmit.addEventListener('click', () => {
            const username = myText.value.trim();
            if (username) {
                StorageManager.setItem(STORAGE_KEYS.USERNAME, username);
                updateWelcomeH1(username);
                
                const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
                mySubmit.style.backgroundColor = '#10b981';
                mySubmit.textContent = lang === 'de' ? 'Gespeichert!' : 'Saved!';
                
                setTimeout(() => {
                    mySubmit.style.backgroundColor = '';
                    mySubmit.textContent = 'Submit';
                    window.location.href = 'home.html';
                }, 800);
            } else {
                myText.focus();
            }
        });

        myText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') mySubmit.click();
        });
        
        document.addEventListener('langchange', () => {
            updateWelcomeH1(myText.value.trim());
        });
    }

    updateDashboardGreeting();
    document.addEventListener('langchange', updateDashboardGreeting);
}

function updateWelcomeH1(username) {
    const myH1 = document.getElementById('myH1');
    if (!myH1) return;
    const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
    myH1.textContent = username
        ? (lang === 'de' ? `Willkommen zurück, ${username}!` : `Welcome back, ${username}!`)
        : (lang === 'de' ? 'Willkommen' : 'Welcome');
}

function updateDashboardGreeting() {
    const welcomeText = document.getElementById('welcome-text');
    if (!welcomeText) return;
    const username = StorageManager.getItem(STORAGE_KEYS.USERNAME, '');
    const lang = document.documentElement.getAttribute('lang') || APP.DEFAULT_LANG;
    const greeting = lang === 'de'
        ? `Hallo${username ? `, ${username}` : ''}! Willkommen auf meinem Umschulungs-Portfolio.`
        : `Hello${username ? `, ${username}` : ''}! Welcome to my retraining portfolio.`;
    welcomeText.innerHTML = greeting;
}
