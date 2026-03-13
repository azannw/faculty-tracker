import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { facultyDirectory } from './data/facultyDirectory';
import { searchFaculty } from './utils/search';

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useDeferredValue: (value) => value,
  };
});


beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

test('renders school filters and directory heading', () => {
  render(<App />);

  expect(screen.getByText(/fast faculty/i)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /school of engineering/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole('button', { name: /business school/i }).length).toBeGreaterThan(0);
});

test('exact name search only returns the targeted faculty member', async () => {
  render(<App />);

  fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: 'Dr. Muhammad Tariq' } });

  expect(await screen.findByText('Dr. Muhammad Tariq')).toBeInTheDocument();
  expect(screen.queryByText('Dr. Niaz Ahmed')).not.toBeInTheDocument();
});

test('business school filter excludes engineering faculty', async () => {
  render(<App />);

  fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: 'Dr.' } });
  await userEvent.click(screen.getAllByRole('button', { name: /business school/i })[0]);

  expect(await screen.findByText('Dr. Sadia Nadeem')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText('Dr. Muhammad Tariq')).not.toBeInTheDocument();
  });
});

test('copy email button copies the selected faculty email', async () => {
  render(<App />);

  fireEvent.change(screen.getByRole('textbox', { name: /search/i }), { target: { value: 'Dr. Muhammad Tariq' } });
  
  const copyButton = await screen.findByRole('button', { name: /^copy$/i });
  await userEvent.click(copyButton);

  expect(navigator.clipboard.writeText).toHaveBeenCalledWith('tariq.khan@nu.edu.pk');
});

test('search utility prioritizes precise name matches', () => {
  const results = searchFaculty(facultyDirectory, 'Dr Muhammad Tariq', 'all', 'all');

  expect(results[0].name).toBe('Dr. Muhammad Tariq');
  expect(results.some((facultyMember) => facultyMember.name === 'Dr. Niaz Ahmed')).toBe(false);
});

test('computing school records include official extensions', () => {
  const facultyMember = facultyDirectory.find(
    (entry) => entry.name === 'Dr. Muhammad Arshad Islam',
  );

  expect(facultyMember?.extension).toBe('3200');
});

test('slash-based business room assignments are mapped pairwise', () => {
  const muhammadAbbas = facultyDirectory.find((entry) => entry.name === 'Dr. Muhammad Abbas');
  const rehanAftab = facultyDirectory.find((entry) => entry.name === 'Dr. Rehan Aftab');

  expect(muhammadAbbas?.office).toContain('114-D');
  expect(muhammadAbbas?.office).not.toContain('209-E');
  expect(rehanAftab?.office).toContain('209-E');
  expect(rehanAftab?.office).not.toContain('114-D');
});
