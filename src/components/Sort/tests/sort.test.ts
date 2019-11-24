var puppeteer = require('puppeteer');
let browser,
  page;
const width = 1000,
  height = 1000,
  appSource: string = "/Users/dipbhattacharjee/Documents/officeDocs_fusionCharts/officeWork/FusionGrid/POCs/Svelte-grid/src/components/Sort/public/index.html";

// test('two plus two is four', () => {
//   expect(str + str).toBe(44);
// });

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: [`--window-size=${width},${height}`]
  });
  page = await browser.newPage();
  await page.goto('file://'+appSource);
});
afterAll(() => {
  browser.close();
});

describe("Sort testing", () => {
  test(
    "You can choose any option from dropdown",
    async (done) => {
      page.waitForSelector('select').then(async ()=>{
        page.select('select','Hi');
        setTimeout(async ()=>{
          let selectedOption = await page.$eval('select', selectEle => {return selectEle.value});
          expect(selectedOption).toBe('Hi');
          done();
        }, 1000);
      });
    },
    16000 // <<< Jasmine timeout
  );
});

