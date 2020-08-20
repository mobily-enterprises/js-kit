const MySQLStore = expressMySqlSession(expressSession)
const sessionStore = new MySQLStore({}, vars.connection)
const session = expressSession({
  key: "<%=userInput['db-sessions'].key%>",
  secret: "<%=userInput['db-sessions'].secret%>",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 * 26 }
})
