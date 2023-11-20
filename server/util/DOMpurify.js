import DOMPurify from 'isomorphic-dompurify';


export function purify(input){
const clean = DOMPurify.sanitize(input);
return clean;
}