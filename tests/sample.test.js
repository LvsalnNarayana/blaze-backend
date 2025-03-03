// check sum =4 test
function checkSum(arr, sum) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === sum) {
        result.push([arr[i], arr[j]]);
      }
    }
  }
  return result;
}

//jest
describe("checkSum", () => {
  it("should return [[1, 3], [2, 2]]", () => {
    expect(checkSum([1, 2, 3, 4, 5], 4)).toEqual([
      [1, 3],
      [2, 2],
    ]);
  });
  it("should return [[1, 3], [2, 2]]", () => {
    expect(checkSum([1, 2, 3, 4, 5], 5)).toEqual([
      [1, 4],
      [2, 3],
    ]);
  });
  it("should return [[1, 3], [2, 2]]", () => {
    expect(checkSum([1, 2, 3, 4, 5], 3)).toEqual([[1, 2]]);
  });
  it("should return [[1, 3], [2, 2]]", () => {
    expect(checkSum([1, 2, 3, 4, 5], 10)).toEqual([]);
  });
});
