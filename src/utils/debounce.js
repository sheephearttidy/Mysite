/**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300, immediate = false) {
    let timeout;

    return function (...args) {
        const context = this;

        if (timeout) {
            clearTimeout(timeout);
        }

        if (immediate) {
            const callNow = !timeout;
            timeout = setTimeout(() => {
                timeout = null;
            }, wait);
            if (callNow) typeof func === 'function' && func.apply(context, args);
        } else {
            timeout = setTimeout(() => {
                typeof func === 'function' && func.apply(context, args);
            }, wait);
        }
    };
}

export default debounce;