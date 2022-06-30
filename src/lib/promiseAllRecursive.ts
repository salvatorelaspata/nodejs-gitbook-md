/* eslint-disable curly */
// type valueProp = Promise<any> | [] | 'object'
export async function promiseAllRecursive (value: any, isAllSettled = false): Promise<any> {
  if (value instanceof Promise) {
    return value
  }

  if (Array.isArray(value)) {
    if (isAllSettled)
      return Promise.allSettled(value.map(async (v) => await promiseAllRecursive(v, isAllSettled)))
    else
      return Promise.all(value.map(async (v) => await promiseAllRecursive(v, isAllSettled)))
  }

  if (typeof value === 'object') {
    return resolveObject(value, isAllSettled)
  }

  return await Promise.resolve(value)
}

async function resolveObject (object: any, isAllSettled = false) {
  const promises = Object.keys(object).map(async (key: string) => {
    return await promiseAllRecursive(object[key], isAllSettled).then(value => ({ key, value }))
  })
  if (isAllSettled)
    return Promise.allSettled(promises).then(results => {
      return results.reduce((obj, pair: any) => {
        obj[pair.key] = pair.value
        return obj
      }, {})
    })
  else
    return Promise.all(promises).then(results => {
      return results.reduce((obj, pair) => {
        obj[pair.key] = pair.value
        return obj
      }, {})
    })
}
