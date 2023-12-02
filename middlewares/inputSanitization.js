const DOMPurify = require('isomorphic-dompurify');

function sanitizeInput(req, res, next) {
  try {
    const sanitisedData = {};
    
    Object.entries(req.body).forEach(([fieldName, fieldValue]) => {
      if (Array.isArray(fieldValue)) {
        // If the field is an array, sanitize each element
        sanitisedData[fieldName] = fieldValue.map((item) =>
          DOMPurify.sanitize(item)
        );
      } else {
        // If the field is not an array, sanitize the entire field
        sanitisedData[fieldName] = DOMPurify.sanitize(fieldValue);
      }
    });
    req.sanitisedData = sanitisedData;
    if (typeof next === "function") {
      next();
    }
  } catch (error) {
    console.log(error);
  }
}
module.exports = sanitizeInput;
