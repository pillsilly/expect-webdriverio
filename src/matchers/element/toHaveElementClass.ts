import { waitUntil, enhanceError, executeCommand, wrapExpectedWithArray, updateElementsArray } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function condition(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions): Promise<any> {
    const { ignoreCase = false, trim = false, containing = false } = options

    let attr = await el.getAttribute(attribute)
    if (typeof attr !== 'string') {
        return { result: false }
    }

    if (trim) {
        attr = attr.trim()
    }
    if (ignoreCase) {
        attr = attr.toLowerCase()
        value = value.toLowerCase()
    }
    if (containing) {
        return {
            result: attr.includes(value),
            value: attr
        }
    }

    const classes = attr.split(' ')

    return {
        result: classes.includes(value),
        value: attr
    }
}

function toHaveElementClassFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, className: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'class', verb = 'have' } = this

    const attribute = 'class'

    return browser.call(async () => {
        let el = await received
        let attr

        const pass = await waitUntil(async () => {
            const result = await executeCommand.call(this, el, condition, options, [attribute, className, options])
            el = result.el
            attr = result.values

            return result.success
        }, isNot, options)

        updateElementsArray(pass, received, el)

        const message = enhanceError(el, wrapExpectedWithArray(el, attr, className), attr, this, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}

export function toHaveElementClass(...args: any): any {
    return runExpect.call(this || {}, toHaveElementClassFn, args)
}

/**
 * toHaveClass conflicts with Jasmine's https://jasmine.github.io/api/edge/matchers#toHaveClass matcher
 * and will be removed from expect-webdriverio in favor of `toHaveElementClass`
 */
export function toHaveClass(...args: any): any {
    console.warn('expect(...).toHaveClass is deprecated and will be removed in next release. Use toHaveElementClass instead.')
    return runExpect.call(this || {}, toHaveElementClassFn, args)
}
