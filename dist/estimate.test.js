"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const estimate_1 = require("./estimate");
describe('estimates', () => {
    it.each([
        [['abc-'], 'abc-1', 'abc-1'],
        [['abc'], 'abx1', null],
        [['abc-'], 'aosiuhdjssdb isjdf abc-2334 oijsdg34 sdg', 'abc-2334'],
        [[], 'abc-21', 'abc-21'],
        [[], 'abc21', null]
    ])(`finds issue in string: %s,"%s"`, (autolinks, string, result) => __awaiter(void 0, void 0, void 0, function* () {
        const ctx = {
            autolinks: autolinks.map(link => {
                return { key_prefix: link };
            }),
            string
        };
        expect(yield (0, estimate_1.findIssueKeyIn)(ctx)).toBe(result);
    }));
    it.each([
        ['feature', 0],
        ['3', 3],
        ['235', 235],
        ['something', 0],
        [[{ name: 'something' }], 0]
    ])('loads estimates from GH ticket %s', (labels, result) => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield (0, estimate_1.loadEstimate)({ data: { labels, body: '' } })).toBe(result);
    }));
});
