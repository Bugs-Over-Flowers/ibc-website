// Generated from: __tests__/e2e/features/sample.feature
import { test } from "playwright-bdd";

test.describe('Sample feature for testing', () => {

  test('Visiting the homepage', async ({ Given, When, Then, page }) => { 
    await Given('I am on the homepage', null, { page }); 
    await When('the page loads'); 
    await Then('I should see the title "Iloilo Business Club"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('__tests__/e2e/features/sample.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the homepage","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Action","textWithKeyword":"When the page loads","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":6,"keywordType":"Outcome","textWithKeyword":"Then I should see the title \"Iloilo Business Club\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Iloilo Business Club\"","children":[{"start":24,"value":"Iloilo Business Club","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end