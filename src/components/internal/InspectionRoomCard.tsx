import { Camera, ChevronDown, Plus, X } from 'lucide-react'
import { useState } from 'react'

export type RoomInspection = {
  hazards: string[]
  id: string
  improvements: string[]
  notes: string
  photos: string[]
  priority: string
  riskLevel: string
  title: string
}

const selectClass =
  'min-h-12 w-full rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15'

export function InspectionRoomCard({
  defaultOpen = false,
  hazardOptions,
  improvementOptions,
  onChange,
  room,
}: {
  defaultOpen?: boolean
  hazardOptions: string[]
  improvementOptions: string[]
  onChange: (room: RoomInspection) => void
  room: RoomInspection
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  function updateRoom(patch: Partial<RoomInspection>) {
    onChange({ ...room, ...patch })
  }

  function toggleValue(field: 'hazards' | 'improvements', value: string) {
    const current = room[field]
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    updateRoom({ [field]: next })
  }

  function addPhoto() {
    updateRoom({ photos: [...room.photos, `${room.title} photo ${room.photos.length + 1}`] })
  }

  function updatePhoto(index: number, label: string) {
    updateRoom({
      photos: room.photos.map((photo, photoIndex) => (photoIndex === index ? label : photo)),
    })
  }

  function removePhoto(index: number) {
    updateRoom({ photos: room.photos.filter((_, photoIndex) => photoIndex !== index) })
  }

  return (
    <details
      className="overflow-hidden rounded-lg border border-border bg-white shadow-soft"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 bg-light-blue px-5 py-4 text-text-dark">
        <div>
          <h3 className="text-xl font-extrabold">{room.title}</h3>
          <p className="text-sm font-semibold text-text-muted">
            {room.hazards.length} hazards - {room.improvements.length} improvements - {room.priority} priority
          </p>
        </div>
        <ChevronDown className="shrink-0 text-navy" size={22} aria-hidden="true" />
      </summary>

      <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">Risk level</span>
              <select
                className={selectClass}
                value={room.riskLevel}
                onChange={(event) => updateRoom({ riskLevel: event.target.value })}
              >
                {['Low', 'Moderate', 'High', 'Critical'].map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-text-dark">Priority</span>
              <select
                className={selectClass}
                value={room.priority}
                onChange={(event) => updateRoom({ priority: event.target.value })}
              >
                {['Immediate', 'High', 'Medium', 'Low'].map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
          </div>

          <Checklist
            items={hazardOptions}
            label="Hazards"
            selected={room.hazards}
            onToggle={(value) => toggleValue('hazards', value)}
          />
        </div>

        <div className="grid gap-5">
          <Checklist
            items={improvementOptions}
            label="Recommended improvements"
            selected={room.improvements}
            onToggle={(value) => toggleValue('improvements', value)}
          />

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-text-dark">Notes</span>
            <textarea
              className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none transition focus:border-green focus:ring-4 focus:ring-green/15"
              value={room.notes}
              onChange={(event) => updateRoom({ notes: event.target.value })}
              placeholder={`Notes about ${room.title.toLowerCase()}...`}
            />
          </label>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-text-dark">Photo placeholders</span>
              <button
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-navy px-4 text-xs font-extrabold text-white transition hover:bg-navy-dark"
                type="button"
                onClick={addPhoto}
              >
                <Plus size={15} aria-hidden="true" />
                Add photo
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {room.photos.map((photo, index) => (
                <div className="rounded-lg border border-dashed border-border bg-light-blue p-3" key={`${photo}-${index}`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Camera className="text-navy" size={19} aria-hidden="true" />
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full bg-white text-text-muted transition hover:text-navy"
                      type="button"
                      aria-label={`Remove ${photo}`}
                      onClick={() => removePhoto(index)}
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>
                  <input
                    className="min-h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-semibold text-text-dark outline-none focus:border-green"
                    value={photo}
                    onChange={(event) => updatePhoto(index, event.target.value)}
                  />
                </div>
              ))}
              {room.photos.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-light-blue p-4 text-sm font-semibold text-text-muted">
                  No photo placeholders yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}

function Checklist({
  items,
  label,
  onToggle,
  selected,
}: {
  items: string[]
  label: string
  onToggle: (value: string) => void
  selected: string[]
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-extrabold text-text-dark">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm font-bold transition ${
              selected.includes(item)
                ? 'border-green bg-green/10 text-text-dark'
                : 'border-border bg-white text-text-mid hover:border-blue/50'
            }`}
            key={item}
          >
            <input
              className="h-4 w-4 accent-green"
              checked={selected.includes(item)}
              type="checkbox"
              onChange={() => onToggle(item)}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
