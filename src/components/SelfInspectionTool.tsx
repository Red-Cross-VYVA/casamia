import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Mail,
  MessageCircle,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useMemo, useRef, useState } from 'react'

import { PhoneNumberField } from './PhoneNumberField'

type AnswerStatus = 'safe' | 'risk' | 'not-sure'

type InspectionQuestion = {
  id: string
  area: string
  prompt: string
  recommendation: string
}

type InspectionRoom = {
  id: string
  title: string
  intro: string
  questions: InspectionQuestion[]
}

type RoomPhoto = {
  id: string
  name: string
  url: string
}

type SelfInspectionReport = {
  answers: Record<string, AnswerStatus>
  completedAt: string
  contact: ContactDetails
  notes: Record<string, string>
  photoSummary: Record<string, string[]>
  recommendations: Array<{
    room: string
    question: string
    recommendation: string
    status: AnswerStatus
  }>
  resident: ResidentProfile
}

type ContactDetails = {
  name: string
  email: string
  phone: string
  consent: boolean
}

type ResidentProfile = {
  residentName: string
  ageRange: string
  livesWith: string
  mobilityLevel: string
  mobilityAids: string[]
  transferNeeds: string[]
  recentFalls: string
  visionHearing: string[]
  cognitiveConcerns: string
  dailyPriorities: string[]
  mainConcern: string
}

const storageKey = 'casamia-self-inspection-reports'

const mobilityAidOptions = ['None', 'Walking stick', 'Walker / rollator', 'Wheelchair', 'Grabber / reacher', 'Other']
const transferNeedOptions = ['Bed', 'Toilet', 'Shower / bath', 'Chair / sofa', 'Car / entrance', 'Stairs']
const visionHearingOptions = ['Low vision', 'Glare sensitivity', 'Hearing difficulty', 'Uses hearing aid', 'Dizziness', 'None']
const dailyPriorityOptions = [
  'Getting to bathroom at night',
  'Showering safely',
  'Using stairs',
  'Cooking independently',
  'Entering the home',
  'Emergency response',
]

const inspectionRooms: InspectionRoom[] = [
  {
    id: 'bathroom',
    title: 'Bathroom',
    intro: 'Transfers, wet areas, toilet height, shower entry, and support points.',
    questions: [
      {
        id: 'bathroom-shower-entry',
        area: 'Shower and bath',
        prompt: 'Can the person enter and exit the shower or bath without stepping over a high edge?',
        recommendation: 'Consider a low-threshold shower, bath board, transfer bench, or grab bars near the entry point.',
      },
      {
        id: 'bathroom-floor',
        area: 'Floor surface',
        prompt: 'Is the bathroom floor non-slip when wet and free from loose mats?',
        recommendation: 'Use anti-slip flooring or fixed anti-slip mats and remove loose rugs.',
      },
      {
        id: 'bathroom-toilet',
        area: 'Toilet transfer',
        prompt: 'Is the toilet height comfortable, with support available when sitting or standing?',
        recommendation: 'Add a raised toilet seat, toilet frame, or wall-mounted support rail.',
      },
      {
        id: 'bathroom-lighting',
        area: 'Lighting',
        prompt: 'Is there clear lighting for night-time bathroom visits?',
        recommendation: 'Add motion lighting between bedroom and bathroom and improve task lighting around the sink.',
      },
      {
        id: 'bathroom-reach',
        area: 'Reach and drying',
        prompt: 'Can towels, clothes, soap, and controls be reached without twisting, bending, or stepping away from support?',
        recommendation: 'Move daily items within easy reach and add shelving or hooks beside the safest transfer point.',
      },
      {
        id: 'bathroom-temperature',
        area: 'Water safety',
        prompt: 'Are taps and shower controls easy to use, with low risk of sudden hot water or confusing settings?',
        recommendation: 'Review mixer controls, add clear markings, and consider thermostatic protection if scald risk is possible.',
      },
    ],
  },
  {
    id: 'stairs',
    title: 'Stairs',
    intro: 'Handrails, step contrast, landings, lighting, and route confidence.',
    questions: [
      {
        id: 'stairs-handrails',
        area: 'Hand support',
        prompt: 'Is there a secure handrail on the full stair route?',
        recommendation: 'Fit a continuous handrail, ideally on both sides when space allows.',
      },
      {
        id: 'stairs-contrast',
        area: 'Step visibility',
        prompt: 'Are step edges easy to see in normal and low light?',
        recommendation: 'Add contrast strips to step edges and improve stair lighting.',
      },
      {
        id: 'stairs-surface',
        area: 'Step surface',
        prompt: 'Are stairs even, non-slip, and clear of objects?',
        recommendation: 'Repair uneven treads, add anti-slip strips, and keep the stair route clear.',
      },
      {
        id: 'stairs-rest',
        area: 'Rest and landing',
        prompt: 'Is there a safe place to pause at the top, bottom, or landing without blocking balance or turning space?',
        recommendation: 'Clear landings, improve turning space, and consider a rest point or stairlift review if fatigue is common.',
      },
      {
        id: 'stairs-carrying',
        area: 'Carrying items',
        prompt: 'Can the person use the stairs without carrying laundry, drinks, or other items that reduce hand support?',
        recommendation: 'Create upstairs/downstairs storage routines or use baskets, rails, or support services to avoid carrying loads.',
      },
    ],
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    intro: 'Bed transfers, night routes, bedside reach, and emergency access.',
    questions: [
      {
        id: 'bedroom-bed-height',
        area: 'Bed transfer',
        prompt: 'Can the person get in and out of bed without dropping down or pushing excessively?',
        recommendation: 'Adjust bed height, add a bed rail, or review mattress and transfer support.',
      },
      {
        id: 'bedroom-route',
        area: 'Night route',
        prompt: 'Is the route from bed to bathroom clear and lit at night?',
        recommendation: 'Clear the route and add motion lighting from bedside to bathroom.',
      },
      {
        id: 'bedroom-reach',
        area: 'Bedside reach',
        prompt: 'Are phone, water, glasses, medication, and light controls reachable from bed?',
        recommendation: 'Reposition bedside essentials and consider voice or remote controls.',
      },
      {
        id: 'bedroom-space',
        area: 'Transfer space',
        prompt: 'Is there enough clear space beside the bed for a walker, wheelchair, carer, or transfer aid if needed?',
        recommendation: 'Rearrange furniture to create a clear transfer side and remove low obstacles near the bed.',
      },
      {
        id: 'bedroom-emergency',
        area: 'Emergency contact',
        prompt: 'Can the person call for help from bed, including at night or after a fall?',
        recommendation: 'Add an emergency call button, wearable alert, or phone charging point within reach from bed.',
      },
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    intro: 'Reach, appliance access, floor safety, task lighting, and work surfaces.',
    questions: [
      {
        id: 'kitchen-storage',
        area: 'Storage',
        prompt: 'Are everyday items stored between shoulder and knee height?',
        recommendation: 'Move daily-use items to easy-reach cupboards or pull-out storage.',
      },
      {
        id: 'kitchen-lighting',
        area: 'Task lighting',
        prompt: 'Are worktops, hob, sink, and preparation areas well lit?',
        recommendation: 'Add under-cabinet task lighting and reduce shadows near appliances.',
      },
      {
        id: 'kitchen-floor',
        area: 'Floor route',
        prompt: 'Is the kitchen floor dry, non-slip, and free from trailing cables or mats?',
        recommendation: 'Remove trip points, secure cables, and use non-slip flooring where needed.',
      },
      {
        id: 'kitchen-seated',
        area: 'Seated tasks',
        prompt: 'Can food preparation be done while seated if standing becomes tiring?',
        recommendation: 'Create a safe seated preparation area with stable chair height and clear knee space.',
      },
      {
        id: 'kitchen-hot-items',
        area: 'Hot items',
        prompt: 'Can hot drinks, pans, and plates be moved without crossing long distances or turning quickly?',
        recommendation: 'Shorten the route between kettle, sink, hob, and table, and consider a trolley or safer appliance layout.',
      },
    ],
  },
  {
    id: 'entrance',
    title: 'Entrance',
    intro: 'Thresholds, steps, door access, outdoor lighting, and key routines.',
    questions: [
      {
        id: 'entrance-threshold',
        area: 'Threshold',
        prompt: 'Can the person enter the home without a difficult step or raised threshold?',
        recommendation: 'Add a threshold ramp, handrail, or entry platform depending on available space.',
      },
      {
        id: 'entrance-lighting',
        area: 'Lighting',
        prompt: 'Is the entrance well lit when arriving after dark?',
        recommendation: 'Install motion-activated lighting at the doorway and path.',
      },
      {
        id: 'entrance-keys',
        area: 'Door routine',
        prompt: 'Is locking, unlocking, and opening the door manageable without rushing or bending?',
        recommendation: 'Consider easier handles, key-safe support, smart access, or a clearer arrival routine.',
      },
      {
        id: 'entrance-width',
        area: 'Door width',
        prompt: 'Is there enough width and turning space for walking aids, shopping bags, or a wheelchair if needed?',
        recommendation: 'Clear the entry zone, review furniture placement, and assess whether threshold or door adjustments are needed.',
      },
      {
        id: 'entrance-seating',
        area: 'Shoes and bags',
        prompt: 'Is there a stable place to sit or lean while putting on shoes, coats, or handling bags?',
        recommendation: 'Add a firm entry chair, wall hooks at reachable height, and a safe surface for bags or keys.',
      },
    ],
  },
  {
    id: 'outdoor',
    title: 'Outdoor areas',
    intro: 'Paths, patio surfaces, garden steps, weather risk, and hand support.',
    questions: [
      {
        id: 'outdoor-path',
        area: 'Pathway',
        prompt: 'Are outdoor paths even, stable, and wide enough for confident walking?',
        recommendation: 'Repair uneven paths, remove loose stones, and widen tight approach routes where possible.',
      },
      {
        id: 'outdoor-steps',
        area: 'Outdoor steps',
        prompt: 'Do outdoor steps have hand support and visible edges?',
        recommendation: 'Add external handrails and step-edge contrast suited for outdoor use.',
      },
      {
        id: 'outdoor-weather',
        area: 'Weather risk',
        prompt: 'Do surfaces remain safe after rain?',
        recommendation: 'Use anti-slip surface treatment, drainage improvements, or covered transition areas.',
      },
      {
        id: 'outdoor-parking',
        area: 'Arrival route',
        prompt: 'Is the route from parking, gate, or street to the front door safe and well lit?',
        recommendation: 'Improve route lighting, remove uneven paving, and add hand support where the approach changes level.',
      },
      {
        id: 'outdoor-maintenance',
        area: 'Maintenance',
        prompt: 'Are plants, bins, hoses, and garden furniture kept away from walking routes?',
        recommendation: 'Create a clear outdoor walking route and schedule regular checks after wind, rain, or garden work.',
      },
    ],
  },
  {
    id: 'living',
    title: 'Living areas',
    intro: 'Daily seating, walking routes, rugs, cables, controls, and emergency reach.',
    questions: [
      {
        id: 'living-routes',
        area: 'Walking routes',
        prompt: 'Are routes between chair, bathroom, kitchen, and entrance wide and free from clutter?',
        recommendation: 'Rearrange furniture to create clear routes and remove low tables or obstacles from turning areas.',
      },
      {
        id: 'living-seating',
        area: 'Chair transfer',
        prompt: 'Can the person stand from their usual chair without rocking, pulling, or losing balance?',
        recommendation: 'Review chair height and firmness, and consider chair raisers, arm support, or a riser recliner.',
      },
      {
        id: 'living-rugs',
        area: 'Rugs and cables',
        prompt: 'Are rugs, cables, pet items, and small furniture secured or removed from walking paths?',
        recommendation: 'Remove loose rugs, secure cables along walls, and keep small movable items away from routes.',
      },
      {
        id: 'living-controls',
        area: 'Controls and help',
        prompt: 'Are phone, remote controls, heating controls, and emergency support easy to reach from the main seat?',
        recommendation: 'Create a reachable control zone and consider voice controls or a wearable alert for emergencies.',
      },
    ],
  },
]

export function SelfInspectionTool() {
  const [activeRoomId, setActiveRoomId] = useState(inspectionRooms[0].id)
  const [answers, setAnswers] = useState<Record<string, AnswerStatus>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<Record<string, RoomPhoto[]>>({})
  const [contact, setContact] = useState<ContactDetails>({
    consent: false,
    email: '',
    name: '',
    phone: '',
  })
  const [resident, setResident] = useState<ResidentProfile>({
    ageRange: '',
    cognitiveConcerns: '',
    dailyPriorities: [],
    livesWith: '',
    mainConcern: '',
    mobilityAids: [],
    mobilityLevel: '',
    recentFalls: '',
    residentName: '',
    transferNeeds: [],
    visionHearing: [],
  })
  const [reportReady, setReportReady] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  const activeRoom = inspectionRooms.find((room) => room.id === activeRoomId) ?? inspectionRooms[0]
  const activeRoomIndex = inspectionRooms.findIndex((room) => room.id === activeRoom.id)
  const totalQuestions = inspectionRooms.reduce((sum, room) => sum + room.questions.length, 0)
  const answeredCount = Object.keys(answers).length
  const completion = Math.round((answeredCount / totalQuestions) * 100)
  const riskItems = useMemo(
    () =>
      inspectionRooms.flatMap((room) =>
        room.questions
          .filter((question) => answers[question.id] === 'risk' || answers[question.id] === 'not-sure')
          .map((question) => ({
            question: question.prompt,
            recommendation: question.recommendation,
            room: room.title,
            status: answers[question.id],
          })),
      ),
    [answers],
  )
  const photoCount = Object.values(photos).reduce((sum, roomPhotos) => sum + roomPhotos.length, 0)
  const highPriorityCount = Object.values(answers).filter((answer) => answer === 'risk').length
  const currentRoomAnswered = activeRoom.questions.filter((question) => answers[question.id]).length
  const currentRoomComplete = currentRoomAnswered === activeRoom.questions.length

  function answerQuestion(questionId: string, status: AnswerStatus) {
    setAnswers((current) => ({ ...current, [questionId]: status }))
    setReportReady(false)
  }

  function updateRoomNote(roomId: string, value: string) {
    setNotes((current) => ({ ...current, [roomId]: value }))
    setReportReady(false)
  }

  function updateResident<Field extends keyof ResidentProfile>(field: Field, value: ResidentProfile[Field]) {
    setResident((current) => ({ ...current, [field]: value }))
    setReportReady(false)
  }

  function toggleResidentValue(
    field: 'mobilityAids' | 'transferNeeds' | 'visionHearing' | 'dailyPriorities',
    value: string,
  ) {
    setResident((current) => {
      const values = current[field]
      const nextValues = values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
      const cleanedValues =
        value === 'None'
          ? ['None']
          : nextValues.filter((item) => !(item === 'None' && nextValues.length > 1))

      return {
        ...current,
        [field]: cleanedValues,
      }
    })
    setReportReady(false)
  }

  function addPhotos(roomId: string, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])

    if (!files.length) {
      return
    }

    setPhotos((current) => ({
      ...current,
      [roomId]: [
        ...(current[roomId] ?? []),
        ...files.slice(0, 6).map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          url: URL.createObjectURL(file),
        })),
      ],
    }))
    setReportReady(false)
    event.target.value = ''
  }

  function removePhoto(roomId: string, photoId: string) {
    setPhotos((current) => ({
      ...current,
      [roomId]: (current[roomId] ?? []).filter((photo) => photo.id !== photoId),
    }))
    setReportReady(false)
  }

  function generateReport() {
    setReportReady(true)
    window.setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function goToRoom(index: number) {
    const nextRoom = inspectionRooms[index]

    if (nextRoom) {
      setActiveRoomId(nextRoom.id)
    }
  }

  function submitReport() {
    if (!contact.name.trim() || (!contact.email.trim() && !contact.phone.trim()) || !contact.consent) {
      setSubmitMessage('Add your name, phone or email, and consent before submitting the report.')
      return
    }

    const report: SelfInspectionReport = {
      answers,
      completedAt: new Date().toISOString(),
      contact,
      notes,
      photoSummary: Object.fromEntries(
        Object.entries(photos).map(([roomId, roomPhotos]) => [roomId, roomPhotos.map((photo) => photo.name)]),
      ),
      recommendations: riskItems,
      resident,
    }
    const existing = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as unknown[]
    window.localStorage.setItem(storageKey, JSON.stringify([report, ...existing].slice(0, 20)))
    setSubmitMessage('Report submitted locally. CasaMia can connect this to email, CRM, or PDF delivery next.')
  }

  return (
    <section className="self-inspection section-pad" id="self-inspection-tool">
      <div className="site-shell">
        <div className="self-inspection-heading">
          <p className="eyebrow">Interactive inspection</p>
          <h2 className="display-title">Build a home safety report room by room.</h2>
          <p>
            Answer a guided checklist, add photos where useful, and create a practical report CasaMia can review.
          </p>
        </div>

        <div className="self-inspection-guide" aria-label="How the inspection works">
          <article>
            <span>1</span>
            <strong>Resident</strong>
            <p>Capture mobility, falls, and daily priorities.</p>
          </article>
          <article>
            <span>2</span>
            <strong>Rooms</strong>
            <p>Check the home one space at a time.</p>
          </article>
          <article>
            <span>3</span>
            <strong>Report</strong>
            <p>Review risks and send the summary.</p>
          </article>
        </div>

        <div className="self-inspection-shell">
          <aside className="self-inspection-sidebar" aria-label="Inspection rooms">
            <div className="self-inspection-progress">
              <span>{completion}% complete</span>
              <div>
                <i style={{ width: `${completion}%` }} />
              </div>
              <small>
                {answeredCount} of {totalQuestions} questions answered
              </small>
            </div>

            <div className="self-inspection-room-tabs">
              {inspectionRooms.map((room) => {
                const answeredInRoom = room.questions.filter((question) => answers[question.id]).length
                const isComplete = answeredInRoom === room.questions.length

                return (
                  <button
                    className={`${room.id === activeRoom.id ? 'is-active' : ''}${isComplete ? ' is-complete' : ''}`}
                    key={room.id}
                    type="button"
                    onClick={() => setActiveRoomId(room.id)}
                  >
                    {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Home size={17} aria-hidden="true" />}
                    <span>{room.title}</span>
                    <small>
                      {answeredInRoom}/{room.questions.length}
                    </small>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="self-inspection-main">
            <div className="self-workflow-column">
              <section className="self-resident-card" aria-label="Resident profile">
                <div className="self-resident-heading">
                  <span>
                    <UserRound size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="eyebrow">Resident profile</p>
                    <h3>Who are we adapting the home for?</h3>
                    <p>Keep this short. The room checklist will do the detailed safety review.</p>
                  </div>
                </div>

                <div className="self-resident-grid">
                  <label className="self-resident-field">
                    Resident name
                    <input
                      value={resident.residentName}
                      onChange={(event) => updateResident('residentName', event.target.value)}
                    />
                  </label>
                  <label className="self-resident-field">
                    Age range
                    <select value={resident.ageRange} onChange={(event) => updateResident('ageRange', event.target.value)}>
                      <option value="">Select age range</option>
                      <option value="Under 65">Under 65</option>
                      <option value="65-74">65-74</option>
                      <option value="75-84">75-84</option>
                      <option value="85+">85+</option>
                    </select>
                  </label>
                  <label className="self-resident-field">
                    Lives with
                    <select value={resident.livesWith} onChange={(event) => updateResident('livesWith', event.target.value)}>
                      <option value="">Select living situation</option>
                      <option value="Alone">Alone</option>
                      <option value="Partner">Partner</option>
                      <option value="Family">Family</option>
                      <option value="Carer support">Carer support</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="self-resident-field">
                    Mobility level
                    <select
                      value={resident.mobilityLevel}
                      onChange={(event) => updateResident('mobilityLevel', event.target.value)}
                    >
                      <option value="">Select mobility level</option>
                      <option value="Independent">Independent</option>
                      <option value="Uses support outside">Uses support outside</option>
                      <option value="Uses support indoors">Uses support indoors</option>
                      <option value="Needs help with transfers">Needs help with transfers</option>
                      <option value="Mostly seated / wheelchair">Mostly seated / wheelchair</option>
                    </select>
                  </label>
                  <label className="self-resident-field">
                    Recent falls
                    <select value={resident.recentFalls} onChange={(event) => updateResident('recentFalls', event.target.value)}>
                      <option value="">Select fall history</option>
                      <option value="No recent falls">No recent falls</option>
                      <option value="One fall in last 12 months">One fall in last 12 months</option>
                      <option value="Two or more falls">Two or more falls</option>
                      <option value="Near misses / fear of falling">Near misses / fear of falling</option>
                    </select>
                  </label>
                  <label className="self-resident-field">
                    Memory or confusion
                    <select
                      value={resident.cognitiveConcerns}
                      onChange={(event) => updateResident('cognitiveConcerns', event.target.value)}
                    >
                      <option value="">Select if relevant</option>
                      <option value="None known">None known</option>
                      <option value="Mild forgetfulness">Mild forgetfulness</option>
                      <option value="Dementia / confusion">Dementia / confusion</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </label>
                </div>

                <details className="self-resident-more">
                  <summary>More resident details</summary>
                  <div className="self-resident-checks">
                    <ResidentCheckGroup
                      label="Mobility aids used"
                      options={mobilityAidOptions}
                      selected={resident.mobilityAids}
                      onToggle={(value) => toggleResidentValue('mobilityAids', value)}
                    />
                    <ResidentCheckGroup
                      label="Transfers that need attention"
                      options={transferNeedOptions}
                      selected={resident.transferNeeds}
                      onToggle={(value) => toggleResidentValue('transferNeeds', value)}
                    />
                    <ResidentCheckGroup
                      label="Vision, hearing, or balance"
                      options={visionHearingOptions}
                      selected={resident.visionHearing}
                      onToggle={(value) => toggleResidentValue('visionHearing', value)}
                    />
                    <ResidentCheckGroup
                      label="Daily priorities"
                      options={dailyPriorityOptions}
                      selected={resident.dailyPriorities}
                      onToggle={(value) => toggleResidentValue('dailyPriorities', value)}
                    />
                  </div>

                  <label className="self-resident-notes">
                    Main concern or extra context
                    <textarea
                      placeholder="Example: Mum is confident during the day but worries about getting to the bathroom at night."
                      value={resident.mainConcern}
                      onChange={(event) => updateResident('mainConcern', event.target.value)}
                    />
                  </label>
                </details>
              </section>

              <article className="self-room-card">
              <div className="self-room-card-header">
                <div>
                  <p className="eyebrow">Current room</p>
                  <h3>{activeRoom.title}</h3>
                  <p>{activeRoom.intro}</p>
                </div>
                <span className={currentRoomComplete ? 'is-complete' : ''}>
                  {currentRoomAnswered}/{activeRoom.questions.length}
                </span>
              </div>

              <div className="self-question-list">
                {activeRoom.questions.map((question) => (
                  <fieldset className="self-question-card" key={question.id}>
                    <legend>
                      <span>{question.area}</span>
                      {question.prompt}
                    </legend>
                    <div className="self-answer-options">
                      <AnswerButton
                        active={answers[question.id] === 'safe'}
                        label="Safe"
                        onClick={() => answerQuestion(question.id, 'safe')}
                      />
                      <AnswerButton
                        active={answers[question.id] === 'risk'}
                        label="Needs attention"
                        onClick={() => answerQuestion(question.id, 'risk')}
                      />
                      <AnswerButton
                        active={answers[question.id] === 'not-sure'}
                        label="Not sure"
                        onClick={() => answerQuestion(question.id, 'not-sure')}
                      />
                    </div>
                    {answers[question.id] === 'risk' || answers[question.id] === 'not-sure' ? (
                      <p className="self-question-recommendation">{question.recommendation}</p>
                    ) : null}
                  </fieldset>
                ))}
              </div>

              <div className="self-room-evidence">
                <label>
                  <span>Room notes</span>
                  <textarea
                    placeholder={`Add notes about ${activeRoom.title.toLowerCase()}...`}
                    value={notes[activeRoom.id] ?? ''}
                    onChange={(event) => updateRoomNote(activeRoom.id, event.target.value)}
                  />
                </label>

                <div className="self-photo-uploader">
                  <div className="self-photo-uploader-header">
                    <div>
                      <span>Photos</span>
                      <small>Optional: add hazards, thresholds, steps, or support points.</small>
                    </div>
                    <label className="self-upload-button">
                      <Upload size={17} aria-hidden="true" />
                      Add photos
                      <input accept="image/*" multiple type="file" onChange={(event) => addPhotos(activeRoom.id, event)} />
                    </label>
                  </div>
                  <div className="self-photo-grid">
                    {(photos[activeRoom.id] ?? []).map((photo) => (
                      <figure key={photo.id}>
                        <img src={photo.url} alt="" />
                        <figcaption>{photo.name}</figcaption>
                        <button type="button" aria-label={`Remove ${photo.name}`} onClick={() => removePhoto(activeRoom.id, photo.id)}>
                          <X size={15} aria-hidden="true" />
                        </button>
                      </figure>
                    ))}
                    {(photos[activeRoom.id] ?? []).length === 0 ? (
                      <div className="self-photo-empty">
                        <Camera size={22} aria-hidden="true" />
                        <span>No photos yet</span>
                        <small>Add one if it helps explain a risk or recommendation.</small>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="self-room-actions">
                <button
                  className="btn btn-white"
                  disabled={activeRoomIndex === 0}
                  type="button"
                  onClick={() => goToRoom(activeRoomIndex - 1)}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                  Previous room
                </button>
                {activeRoomIndex < inspectionRooms.length - 1 ? (
                  <button className="btn btn-green" type="button" onClick={() => goToRoom(activeRoomIndex + 1)}>
                    Next room
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <button className="btn btn-green" type="button" onClick={generateReport}>
                    Generate report
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              </article>
            </div>

            <aside className="self-report-panel" ref={reportRef}>
              <div className="self-report-summary">
                <FileText size={24} aria-hidden="true" />
                <div>
                  <p className="eyebrow">Live report</p>
                  <h3>{riskItems.length ? `${riskItems.length} items to review` : 'No risks marked yet'}</h3>
                </div>
              </div>
              <div className="self-report-metrics">
                <Metric label="High priority" value={`${highPriorityCount}`} />
                <Metric label="Photos" value={`${photoCount}`} />
                <Metric label="Answered" value={`${completion}%`} />
              </div>
              {resident.mobilityLevel || resident.recentFalls || resident.mainConcern ? (
                <div className="self-report-resident">
                  <strong>Resident context</strong>
                  {resident.mobilityLevel ? <span>{resident.mobilityLevel}</span> : null}
                  {resident.recentFalls ? <span>{resident.recentFalls}</span> : null}
                  {resident.mainConcern ? <p>{resident.mainConcern}</p> : null}
                </div>
              ) : null}
              <div className="self-report-list">
                {riskItems.slice(0, 6).map((item) => (
                  <article key={`${item.room}-${item.question}`}>
                    <strong>{item.room}</strong>
                    <p>{item.question}</p>
                    <small>{item.recommendation}</small>
                  </article>
                ))}
                {riskItems.length === 0 ? (
                  <p className="self-report-placeholder">
                    Mark an item as Needs attention or Not sure to build the recommendations list.
                  </p>
                ) : null}
              </div>

              <button className="btn btn-navy" type="button" onClick={generateReport}>
                Generate report
                <ArrowRight size={19} aria-hidden="true" />
              </button>

              {reportReady ? (
                <div className="self-submit-card">
                  <CheckCircle2 size={22} aria-hidden="true" />
                  <h4>Report ready to submit</h4>
                  <div className="self-contact-grid">
                    <label>
                      Name
                      <input value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(event) => setContact({ ...contact, email: event.target.value })}
                      />
                    </label>
                    <PhoneNumberField
                      className="self-phone-field"
                      label="Phone"
                      value={contact.phone}
                      onChange={(phone) => setContact({ ...contact, phone })}
                    />
                  </div>
                  <label className="self-consent">
                    <input
                      checked={contact.consent}
                      type="checkbox"
                      onChange={(event) => setContact({ ...contact, consent: event.target.checked })}
                    />
                    <span>I agree CasaMia can use this survey to prepare a safety report and contact me.</span>
                  </label>
                  {submitMessage ? <p className="self-submit-message">{submitMessage}</p> : null}
                  <div className="self-submit-actions">
                    <button className="btn btn-green" type="button" onClick={submitReport}>
                      Submit report
                      <Mail size={18} aria-hidden="true" />
                    </button>
                    <a
                      className="btn btn-white"
                      href={`https://wa.me/34900000000?text=${encodeURIComponent(
                        `Hello CasaMia, I completed the self-inspection survey. ${riskItems.length} items need review.`,
                      )}`}
                    >
                      WhatsApp
                      <MessageCircle size={18} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

function AnswerButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button className={active ? 'is-active' : ''} type="button" onClick={onClick}>
      {label}
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function ResidentCheckGroup({
  label,
  onToggle,
  options,
  selected,
}: {
  label: string
  onToggle: (value: string) => void
  options: string[]
  selected: string[]
}) {
  return (
    <fieldset className="self-resident-check-group">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label className={selected.includes(option) ? 'is-selected' : ''} key={option}>
            <input checked={selected.includes(option)} type="checkbox" onChange={() => onToggle(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
