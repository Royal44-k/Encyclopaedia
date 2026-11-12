const moduleId = new URLSearchParams(location.search).get('module');
document.title = `The English Valley · ${moduleId === 'T02' ? 'The treehouse at dusk' : moduleId === 'T01' ? 'The workshop' : 'After the rain'}`;
if (moduleId === 'T01') await import('./workshop-main.js');
else if (moduleId === 'T02') await import('./night-main.js');
else await import('./main.js');
