/**
 * Native suggestions for an <input list={id}>: the browser filters them as the user
 * types and handles the keyboard. Fine for thousands of plain strings.
 */
export function SuggestionsList({ id, options }: { id: string; options: readonly string[] | undefined }) {
  return (
    <datalist id={id}>
      {options?.map((option) => <option key={option} value={option} />)}
    </datalist>
  )
}
