
/**
 * Transforms the given data into an array of objects with key-value pairs.
 *
 * @param {Object} data - The data object containing keys and values.
 * @returns {Object[]} - An array of objects, each representing a row of key-value pairs.
 */
export const transformData = (data) => {
    const { keys, values } = data.message;

    // Check if keys and values are present
    if (!keys || !values) {
        throw new Error('Invalid data format');
    }

    // Transform values into array of objects
    return values.map((valueArray) => {
        // Create an object with key-value pairs
        return keys.reduce((obj, key, index) => {
            obj[key] = valueArray[index];
            return obj;
        }, {});
    });
};
