var mocha = require('mocha');
var expect = require('chai').expect;
var microUtils = require('../../src/scripts/utilities/micro-utilities.js');

describe('map range', function() {
  it('should return a floating point number when all args are numbers', function() {
    expect(microUtils.mapRange(1, 2, 3, 4, 5)).to.be.a('number');
  });
  it('should return 10 when value is 5 range 1 is 0-10 and range 2 is 0-20', function() {
    expect(microUtils.mapRange(5, 0, 10, 0, 20)).to.equal(10);
  });
  it('should return false when one of the args in not type number', function() {
    expect(microUtils.mapRange(5, 0, 10, 0, false)).to.be.false;
  });
});

describe('get the numeric ordinal (or suffix) of a number', function() {
  it('should return a string when passed a number', function() {
    expect(microUtils.getOrdinal(10)).to.be.a('string');
  });
  it('should return a string with the correct suffix when passed a number as a string', function() {
    expect(microUtils.getOrdinal('10')).to.be.a('string');
  });
  it('should return a string when passed a string that\'s not a number', function() {
    expect(microUtils.getOrdinal('to')).to.be.a('string');
  });
  it('should return false when passed an array', function() {
    expect(microUtils.getOrdinal([0,1,2])).to.be.false;
  });
  it('should return false when passed an object', function() {
    expect(microUtils.getOrdinal({})).to.be.false;
  });
  it('should return false when passed false', function() {
    expect(microUtils.getOrdinal(false)).to.be.false;
  });
  it('should return a string with the suffix \'st\' when passed 1', function() {
    expect(microUtils.getOrdinal(1)).to.equal('1st');
  });
  it('should return a string with the suffix \'nd\' when passed 2', function() {
    expect(microUtils.getOrdinal(2)).to.equal('2nd');
  });
  it('should return a string with the ordinal \'th\' when passed 4', function() {
    expect(microUtils.getOrdinal(4)).to.equal('4th');
  });
  it('should return a string with the suffix \'rd\' when passed 3', function() {
    expect(microUtils.getOrdinal(3)).to.equal('3rd');
  });
  it('should return a string with the suffix \'th\' when passed 11', function() {
    expect(microUtils.getOrdinal(11)).to.equal('11th');
  });
  it('should return a string with the suffix \'st\' when passed 21', function() {
    expect(microUtils.getOrdinal(21)).to.equal('21st');
  });
  it('should return a string with the suffix \'th\' when passed 12', function() {
    expect(microUtils.getOrdinal(12)).to.equal('12th');
  });
  it('should return a string with the suffix \'nd\' when passed 22', function() {
    expect(microUtils.getOrdinal(22)).to.equal('22nd');
  });
});

describe('has space at start of string', function() {
  it('should return true when a string with space at the start is passed', function() {
    expect(microUtils.strHasSpaceAtStart(' Another')).to.be.true;
  });
  it('should return false when a string with no space at the start is passed', function() {
    expect(microUtils.strHasSpaceAtStart('Another')).to.be.false;
  });
});

describe('remove space from start of string', function() {
  it('should return a string with no space at the start when passed a string with a space', function() {
    expect(microUtils.rmSpaceFromStart(' Another')).to.equal('Another');
  });
  it('should return same string when passed a string with no space at start', function() {
    expect(microUtils.rmSpaceFromStart('Text')).to.equal('Text');
  });
  it('should return a string with spaces other than start in tact', function() {
    expect(microUtils.rmSpaceFromStart(' Text Test')).to.equal('Text Test');
  });
  it('should throw when passed an array', function() {
    expect(function() {
      microUtils.rmSpaceFromStart([0,1,2]);
    }).to.throw();
  });
  it('should throw when passed an object', function() {
    expect(function() {
      microUtils.rmSpaceFromStart({});
    }).to.throw();
  });
  it('should throw when passed a number', function() {
    expect(function() {
      microUtils.rmSpaceFromStart(10);
    }).to.throw();
  });
});

describe('add spaces to a string where caps are follwed by lower case', function() {
  it('should return a string with a space between "All" and "Be" when passed AllBe', function() {
    expect(microUtils.addSpacesToString('AllBe')).to.equal('All Be');
  });
  it('should return a string with no space at the start when passed a string with a space at the start', function() {
    expect(microUtils.addSpacesToString(' Another')).to.equal('Another');
  });
});

describe('remove spaces from a string', function() {
  it('should return a string with no spaces when passed a string with spaces', function() {
    expect(microUtils.removeSpacesFromString(' We Are Together Again')).to.equal('WeAreTogetherAgain');
  });
  it('should return same string when passed a string with no spaces', function() {
    expect(microUtils.removeSpacesFromString('compact')).to.equal('compact');
  });
});

describe('replace commas for hyphens', function() {
  it('should return a string with hyphens when passed one that has commas', function() {
    expect(microUtils.replaceCommasForHyphens('this,is,comma,separated')).to.equal('this-is-comma-separated');
  });
  it('should throw when an array is passed', function() {
    expect(function() {
      microUtils.replaceCommasForHyphens([0,1,2]);
    }).to.throw();
  });
  it('should throw when an object is passed', function() {
    expect(function() {
      microUtils.replaceCommasForHyphens({});
    }).to.throw();
  });
  it('should throw when a number is passed', function() {
    expect(function() {
      microUtils.replaceCommasForHyphens(10);
    }).to.throw();
  });
});

describe('replace hyphens for spaces', function() {
  it('should return a string with spaces when passed one that has hyphens', function() {
    expect(microUtils.replaceHyphensForSpaces('this-is-hyphenated')).to.equal('this is hyphenated');
  });
  it('should throw when an array is passed', function() {
    expect(function() {
      microUtils.replaceHyphensForSpaces([0,1,2]);
    }).to.throw();
  });
  it('should throw when an object is passed', function() {
    expect(function() {
      microUtils.replaceHyphensForSpaces({});
    }).to.throw();
  });
  it('should throw when a number is passed', function() {
    expect(function() {
      microUtils.replaceHyphensForSpaces(10);
    }).to.throw();
  });
});

describe('contains word', function() {
  it('should a string with hyphens when passed one that has commas', function() {
    expect(microUtils.containsWord('word search', 'search')).to.be.true;
  });
  it('should return false when an array is passed as first arg', function() {
    expect(microUtils.containsWord([0,1,2])).to.be.false;
  });
  it('should throw when an object is passed', function() {
    expect(microUtils.containsWord({})).to.be.false;
  });
  it('should throw when a number is passed', function() {
    expect(microUtils.containsWord(10)).to.be.false;
  });
});

describe('convert string to lower case', function() {
  it('should return a string with all lower case characters when passed one that contains upper case', function() {
    expect(microUtils.strToLowerCase('CamelCase')).to.equal('camelcase');
  });
  it('should throw when an array is passed as first arg', function() {
    expect(function() {
      microUtils.strToLowerCase([0,1,2]);
    }).to.throw();
  });
  it('should throw when an object is passed', function() {
    expect(function() {
      microUtils.strToLowerCase({});
    }).to.throw();
  });
  it('should throw when a number is passed', function() {
    expect(function() {
      microUtils.strToLowerCase(10);
    }).to.throw();
  });
});

describe('remove string from start', function() {
  it('should return a string without the value stringToRemove argument at start', function() {
    expect(microUtils.removeStrFromStart('The', 'The pointless pronoun')).to.equal(' pointless pronoun');
  });
  it('should throw when an array is passed as first arg', function() {
    expect(function() {
      microUtils.removeStrFromStart([0,1,2]);
    }).to.throw();
  });
  it('should throw when an object is passed', function() {
    expect(function() {
      microUtils.removeStrFromStart({});
    }).to.throw();
  });
  it('should throw when a number is passed', function() {
    expect(function() {
      microUtils.removeStrFromStart(10);
    }).to.throw();
  });
});

describe('add array items', function() {
  it('should return an number that\'s the product of the first item added to the last', function() {
    expect(microUtils.addArrayItems([5,10])).to.equal(15);
  });
  it('should throw when argument is a number', function() {
    expect(function() {
      microUtils.addArrayItems(10)
    }).to.throw();
  });
  it('should throw when no argument is provided', function() {
    expect(function() {
      microUtils.addArrayItems()
    }).to.throw();
  });
});

describe('has Sixth Seventh Ninth', function() {
  it('should return true if argument contains strings "Sixth" "Seventh" "Ninth"', function() {
    expect(microUtils.hasSixthSeventhNinth('This string has the word Ninth')).to.be.true;
  });
  it('should return false if argument does not contain strings "Sixth" "Seventh" "Ninth"', function() {
    expect(microUtils.hasSixthSeventhNinth('This string has nothing')).to.be.false;
  });
  it('should return false when an array is passed as first arg', function() {
    expect(microUtils.hasSixthSeventhNinth([0,1,2])).to.be.false;
  });
  it('should throw when an object is passed', function() {
    expect(microUtils.hasSixthSeventhNinth({})).to.be.false;
  });
  it('should throw when a number is passed', function() {
    expect(microUtils.hasSixthSeventhNinth(10)).to.be.false;
  });
});
