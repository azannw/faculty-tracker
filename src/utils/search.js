const normalizeSearchValue = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value = '') => normalizeSearchValue(value).split(' ').filter(Boolean);

const getLevenshteinDistance = (left, right) => {
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix = Array.from({ length: right.length + 1 }, (_, rowIndex) => [rowIndex]);

  for (let columnIndex = 0; columnIndex <= left.length; columnIndex += 1) {
    matrix[0][columnIndex] = columnIndex;
  }

  for (let rowIndex = 1; rowIndex <= right.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= left.length; columnIndex += 1) {
      if (right[rowIndex - 1] === left[columnIndex - 1]) {
        matrix[rowIndex][columnIndex] = matrix[rowIndex - 1][columnIndex - 1];
      } else {
        matrix[rowIndex][columnIndex] = Math.min(
          matrix[rowIndex - 1][columnIndex - 1] + 1,
          matrix[rowIndex][columnIndex - 1] + 1,
          matrix[rowIndex - 1][columnIndex] + 1,
        );
      }
    }
  }

  return matrix[right.length][left.length];
};

const getNameMatchScore = (name, query) => {
  const normalizedName = normalizeSearchValue(name);
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 1000;
  if (normalizedName.startsWith(normalizedQuery)) return 900;
  if (normalizedName.includes(normalizedQuery)) return 800;

  const nameTokens = tokenize(name);
  const queryTokens = tokenize(query);

  if (!queryTokens.length) return 0;

  const exactTokenMatch = queryTokens.every((queryToken) => nameTokens.includes(queryToken));
  if (exactTokenMatch) return 700;

  const prefixTokenMatch = queryTokens.every((queryToken) =>
    nameTokens.some((nameToken) => nameToken.startsWith(queryToken)),
  );
  if (prefixTokenMatch) return 600;

  let fuzzyPenalty = 0;

  const fuzzyMatch = queryTokens.every((queryToken) => {
    if (queryToken.length < 4) {
      return nameTokens.some(
        (nameToken) => nameToken === queryToken || nameToken.startsWith(queryToken),
      );
    }

    const allowedDistance = queryToken.length > 6 ? 2 : 1;
    const candidate = nameTokens.find((nameToken) => {
      if (nameToken[0] !== queryToken[0]) {
        return false;
      }

      const distance = getLevenshteinDistance(nameToken, queryToken);
      if (distance <= allowedDistance) {
        fuzzyPenalty += distance;
        return true;
      }

      return false;
    });

    return Boolean(candidate);
  });

  if (fuzzyMatch) {
    return 450 - fuzzyPenalty * 25;
  }

  return 0;
};

const getSecondaryMatchScore = (facultyMember, query) => {
  const normalizedQuery = normalizeSearchValue(query);
  const secondaryFields = [
    facultyMember.email,
    facultyMember.department,
    facultyMember.schoolLabel,
    facultyMember.office,
    facultyMember.extension,
  ]
    .map(normalizeSearchValue)
    .filter(Boolean);

  return secondaryFields.some((field) => field.includes(normalizedQuery)) ? 250 : 0;
};

export const searchFaculty = (facultyDirectory, query, schoolFilter, departmentFilter) => {
  const filteredDirectory = facultyDirectory.filter((facultyMember) => {
    const schoolMatches = schoolFilter === 'all' || facultyMember.school === schoolFilter;
    const departmentMatches =
      departmentFilter === 'all' || facultyMember.department === departmentFilter;

    return schoolMatches && departmentMatches;
  });

  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return filteredDirectory.sort((left, right) => left.name.localeCompare(right.name));
  }

  const scored = filteredDirectory
    .map((facultyMember) => {
      const nameScore = getNameMatchScore(facultyMember.name, normalizedQuery);
      const secondaryScore = nameScore > 0 ? 0 : getSecondaryMatchScore(facultyMember, normalizedQuery);

      return {
        ...facultyMember,
        score: Math.max(nameScore, secondaryScore),
      };
    })
    .filter((facultyMember) => facultyMember.score > 0);

  const maxScore = scored.reduce((max, r) => Math.max(max, r.score), 0);
  const minAllowedScore = maxScore >= 700 ? 400 : 0;

  return scored
    .filter((r) => r.score >= minAllowedScore)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
};

export { normalizeSearchValue };
