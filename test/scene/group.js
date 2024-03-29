import assert from 'power-assert';
import { Group } from '../../src/scene/group.js';
import { Avatar } from '../../src/scene/avatar.js';

suite('group');

test('recursive removal', () => {
    const group = new Group();
    const avatarA = new Avatar(group);
    assert(avatarA.container === group);
    const avatarB = new Avatar(group);
    assert(avatarB.container === group);
    assert(group.contents.length === 2);
    group.remove();
    assert(group.contents == null);
});
