document.addEventListener('DOMContentLoaded', function() {
    const testElement = document.createElement('div');
    testElement.style.background = '#4CAF50';
    testElement.style.color = 'white';
    testElement.style.padding = '10px';
    testElement.style.margin = '10px';
    testElement.style.borderRadius = '5px';
    testElement.innerHTML = '✅ JavaScript toimii!';
    document.body.appendChild(testElement);
});
