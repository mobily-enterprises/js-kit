// If dynamic loading is set, entries here will be commented out by default
// Having the entry uncommented means that loading will not be dynamic
// At build time, any uncommented code is directly impored, and so will be
// included in the main app

// Dynamic loading flag
const DYNAMIC_LOADING = <%=userInput['client-app-frame'].dynamicLoading ? 'true' : 'false'%>
