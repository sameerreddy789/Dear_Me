import { useParams } from 'react-router-dom'

function EditorPage() {
  const { entryId } = useParams()

  return (
    <div className="p-6">
      <h1 className="font-['Caveat'] text-3xl text-[var(--color-text)] mb-4">
        {entryId ? 'Edit Entry' : 'New Entry'}
      </h1>
      <p className="font-['Poppins'] text-[var(--color-text)]">
        {entryId ? `Editing entry: ${entryId}` : 'Start writing your thoughts...'}
      </p>
    </div>
  )
}

export default EditorPage
