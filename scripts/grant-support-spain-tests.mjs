import assert from 'node:assert/strict'

import { evaluateGrantEligibility } from '../src/services/grantSupportSpain.ts'

const base = {
  difficulties: [],
  adaptations: [],
  documents: [],
}

function evaluate(overrides) {
  return evaluateGrantEligibility({
    ...base,
    ...overrides,
    difficulties: overrides.difficulties ?? [],
    adaptations: overrides.adaptations ?? [],
    documents: overrides.documents ?? [],
  })
}

assert.equal(
  evaluate({
    location: { autonomousCommunity: 'Comunidad de Madrid', municipality: 'Madrid', postalCode: '28001' },
    age: 'De 75 a 84',
    disability: 'Sí, del 33% al 64%',
    dependency: 'Grado II',
    difficulties: ['Riesgo de caídas', 'Utiliza silla de ruedas'],
    habitualResidence: 'Sí',
    padron: 'Sí',
    propertyRelation: 'Propietario',
    income: 'Ingresos medios',
    adaptations: ['Adaptar completamente el baño', 'Instalar un salvaescaleras', 'Eliminar escalones'],
    workStatus: 'La obra no ha comenzado',
  }).level,
  'high-likelihood',
)

assert.equal(
  evaluate({
    location: { autonomousCommunity: 'Andalucía', municipality: 'Sevilla' },
    age: 'De 65 a 74',
    difficulties: ['Riesgo de caídas'],
    habitualResidence: 'Sí',
    propertyRelation: 'Inquilino sin permiso todavía',
    adaptations: ['Cambiar bañera por ducha'],
  }).level,
  'good-possibility',
)

assert.equal(
  evaluate({
    age: 'De 60 a 64',
    difficulties: ['Dificultad para utilizar la bañera'],
    adaptations: ['Instalar barras de apoyo'],
  }).level,
  'review-required',
)

assert.equal(evaluate({}).level, 'alternative-support')

const under60WithDisability = evaluate({
  age: 'Menos de 60',
  disability: 'Sí, del 65% o superior',
  difficulties: ['Utiliza silla de ruedas'],
  adaptations: ['Construir una rampa'],
})
assert.notEqual(under60WithDisability.level, 'alternative-support')
assert(under60WithDisability.favourableFactors.includes('Discapacidad reconocida'))

const tenant = evaluate({
  propertyRelation: 'Inquilino con permiso del propietario',
  habitualResidence: 'Sí',
  padron: 'Sí',
  adaptations: ['Cambiar bañera por ducha'],
})
assert(tenant.favourableFactors.includes('Relación con la vivienda compatible'))

const community = evaluate({
  propertyRelation: 'Comunidad de propietarios',
  propertyArea: 'En las zonas comunes del edificio',
  adaptations: ['Instalar o adaptar un ascensor'],
})
assert(community.availableFundingRoutes.includes('Ayudas para edificios y zonas comunes'))

const started = evaluate({
  workStatus: 'La obra ya ha comenzado',
  adaptations: ['Adaptar la cocina'],
})
assert(started.informationToVerify.includes('Compatibilidad si la obra ya empezó o terminó'))

console.log('Grant support Spain tests passed')
