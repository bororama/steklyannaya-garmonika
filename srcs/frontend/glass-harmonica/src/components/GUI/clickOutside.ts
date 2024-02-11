import { onBeforeUnmount, onMounted } from 'vue'

export function useClickOutside(component:any, callback:any, excludeComponent:any) {
  if (!component) {
    throw new Error('No target provided')
  }

  if (!callback) {
    throw new Error('No callback provided')
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function')
  }

  const listener = (event) => {
    if (
      event.target === component.value ||
      event.composedPath().includes(component.value) ||
      event.target === excludeComponent.value ||
      event.composedPath().includes(excludeComponent.value)
    ) {
      return
    } else {
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener('click', listener)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', listener)
  })

}
