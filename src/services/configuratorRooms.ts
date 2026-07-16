import type { ConfiguratorRoomId, ConfiguratorState, LegacyPackageId } from '../types/configurator'

const legacyPackageRoomMap: Record<LegacyPackageId, ConfiguratorRoomId> = {
  'entrance-safe': 'entrance',
  'home-movement-safe': 'movement',
  'kitchen-independence': 'kitchen',
  'bedroom-night-safe': 'bedroom',
  'bathroom-safe': 'bathroom',
  'connected-safety-vyva': 'connected',
}

const roomOrder: ConfiguratorRoomId[] = ['entrance', 'movement', 'kitchen', 'bedroom', 'bathroom', 'connected']

type RoomSelectionState = Pick<ConfiguratorState, 'selectedRoomIds'> & {
  selectedPackageIds?: LegacyPackageId[]
}

export function getSelectedRoomIds(state: RoomSelectionState): ConfiguratorRoomId[] {
  const roomIds = normaliseRoomIds(state.selectedRoomIds)

  if (roomIds.length > 0) {
    return roomIds
  }

  return roomIdsFromLegacyPackages(state.selectedPackageIds)
}

export function isRoomSelected(state: RoomSelectionState, roomId: ConfiguratorRoomId) {
  return getSelectedRoomIds(state).includes(roomId)
}

export function roomIdsFromLegacyPackages(packageIds: LegacyPackageId[] = []) {
  return normaliseRoomIds(packageIds.map((packageId) => legacyPackageRoomMap[packageId]).filter(Boolean))
}

export function syncRoomSelections<T extends { selectedRoomIds?: ConfiguratorRoomId[] }>(state: T): T & {
  selectedRoomIds: ConfiguratorRoomId[]
} {
  return {
    ...state,
    selectedRoomIds: normaliseRoomIds(state.selectedRoomIds),
  }
}

function normaliseRoomIds(roomIds: Array<ConfiguratorRoomId | undefined> = []) {
  const selected = getUniqueValues(roomIds.filter(Boolean) as ConfiguratorRoomId[])

  return roomOrder.filter((roomId) => selected.includes(roomId))
}

function getUniqueValues<T>(values: T[]) {
  return Array.from(new Set(values))
}
