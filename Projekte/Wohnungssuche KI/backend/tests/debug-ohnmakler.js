import { fetchPageContent } from '../browser.js';
import * as cheerio from 'cheerio';

const html = await fetchPageContent('https://www.ohne-makler.net/immobilien/wohnung-mieten/nordrhein-westfalen/bonn/');
const $ = cheerio.load(html);

// Gehe über jeden echten Link und schaue auf den unmittelbaren Eltern-Container
const links = $('a[href*="/immobilie/"]').filter((i, el) => {
  return $(el).attr('href')?.match(/\/immobilie\/\d+\//);
});

// Zeige den direkten Eltern-Container (1-2 Ebenen)
const firstLink = links.first();
const p1 = firstLink.parent();
const p2 = firstLink.parent().parent();

console.log('Link-Container (Parent 1):');
console.log('  tag:', p1.prop('tagName'), 'class:', p1.attr('class'));
console.log('  HTML:', p1.html()?.substring(0, 500));

console.log('\nGrand-Parent (Parent 2):');
console.log('  tag:', p2.prop('tagName'), 'class:', p2.attr('class'));

// Zeige den Link selbst
console.log('\nLink eigene HTML:', firstLink.prop('outerHTML')?.substring(0, 1000));

// Schaue: welche h4 ist DEM link zugeordnet? Ist sie ein Geschwister/Cousin?
// Struktur: <a href="/immobilie/440341/"> enthält die h4?
console.log('\nInner HTML des Links:');
console.log(firstLink.html()?.substring(0, 500));
