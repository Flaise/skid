import assert from 'power-assert';
import { contentTypeMatches } from '../src/load';

suite('load');

test('content-type checking', () => {
    assert(contentTypeMatches('text/html', 'text/html'));
    assert(contentTypeMatches('text', 'text/html'));
    assert(contentTypeMatches('text', 'text'));
    assert(contentTypeMatches('text', 'text/plain'));
});

test('content-type semicolon', () => {
    assert(contentTypeMatches('text/html', 'text/html; charset=utf-8'));
    assert(contentTypeMatches('text/html; charset=utf-8', 'text/html; charset=utf-8'));
    assert(contentTypeMatches('text', 'text/html; charset=utf-8'));
});

