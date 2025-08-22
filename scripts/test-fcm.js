#!/usr/bin/env node

/**
 * Script de prueba para verificar la funcionalidad de FCM
 * Ejecuta: node scripts/test-fcm.js
 */

const https = require('https')
const { API_ENDPOINTS } = require('../lib/firebase-config')

console.log('🧪 Iniciando pruebas de FCM...\n')

// Función para hacer peticiones HTTP
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data)
    
    const options = {
      hostname: new URL(url).hostname,
      port: 443,
      path: new URL(url).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({
            status: res.statusCode,
            data: parsed
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

// Función para probar suscripción
async function testSubscribe() {
  console.log('📱 Probando suscripción...')
  
  try {
    const testToken = `test_token_${Date.now()}`
    const response = await makeRequest(API_ENDPOINTS.SUBSCRIBE, { token: testToken })
    
    if (response.status === 200) {
      console.log('✅ Suscripción exitosa:', response.data)
    } else {
      console.log('❌ Error en suscripción:', response.status, response.data)
    }
  } catch (error) {
    console.log('❌ Error de red en suscripción:', error.message)
  }
}

// Función para probar envío de alarma
async function testSendAlarm() {
  console.log('🚨 Probando envío de alarma...')
  
  try {
    const response = await makeRequest(API_ENDPOINTS.SEND_ALARM, {
      type: 'sound',
      message: 'Prueba de alarma desde script'
    })
    
    if (response.status === 200) {
      console.log('✅ Alarma enviada exitosamente:', response.data)
    } else {
      console.log('❌ Error enviando alarma:', response.status, response.data)
    }
  } catch (error) {
    console.log('❌ Error de red enviando alarma:', error.message)
  }
}

// Función para probar desuscripción
async function testUnsubscribe() {
  console.log('📱 Probando desuscripción...')
  
  try {
    const testToken = `test_token_${Date.now()}`
    const response = await makeRequest(API_ENDPOINTS.UNSUBSCRIBE, { token: testToken })
    
    if (response.status === 200) {
      console.log('✅ Desuscripción exitosa:', response.data)
    } else {
      console.log('❌ Error en desuscripción:', response.status, response.data)
    }
  } catch (error) {
    console.log('❌ Error de red en desuscripción:', error.message)
  }
}

// Función principal de pruebas
async function runTests() {
  console.log('🔍 Verificando configuración...')
  console.log('📡 Endpoints configurados:')
  console.log(`   SEND_ALARM: ${API_ENDPOINTS.SEND_ALARM}`)
  console.log(`   SUBSCRIBE: ${API_ENDPOINTS.SUBSCRIBE}`)
  console.log(`   UNSUBSCRIBE: ${API_ENDPOINTS.UNSUBSCRIBE}`)
  console.log('')

  // Verificar que los endpoints no sean placeholders
  const hasPlaceholders = Object.values(API_ENDPOINTS).some(url => 
    url.includes('tu-region') || url.includes('tu-proyecto')
  )
  
  if (hasPlaceholders) {
    console.log('⚠️  ADVERTENCIA: Los endpoints contienen valores placeholder')
    console.log('   Actualiza lib/firebase-config.js con las URLs reales de tus Cloud Functions')
    console.log('')
  }

  // Ejecutar pruebas
  await testSubscribe()
  console.log('')
  
  await testSendAlarm()
  console.log('')
  
  await testUnsubscribe()
  console.log('')
  
  console.log('🏁 Pruebas completadas')
  
  if (hasPlaceholders) {
    console.log('\n📝 Próximos pasos:')
    console.log('1. Configura Firebase siguiendo FIREBASE_SETUP_COMPLETE.md')
    console.log('2. Actualiza lib/firebase-config.js con las URLs reales')
    console.log('3. Ejecuta este script nuevamente para verificar')
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests, testSubscribe, testSendAlarm, testUnsubscribe }
