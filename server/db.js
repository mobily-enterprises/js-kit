
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


// *********************************************************
// Schema definitions
// *********************************************************


// *************************
// LOGGER
// *************************
var Log = new Schema({
  workspaceName  : { type: String },
  userId         : { type: ObjectId, index: true },
  logLevel       : { type: Number, enum:[0,1] },
  message        : { type: String },
  reqInfo        : { type: String },
  data           : { type: String },
  loggedOn       : { type: Date, index: true },
});
mongoose.model('Log', Log);

// *************************
// BASICS (USERS, WS, ETC.)
// *************************

var Country =  new Schema({
  name     : String
});
mongoose.model('Country', Country);



var Access = new Schema({
  login          : { type: String },
  key            : { type: String, index: true },
  isOwner        : { type: Boolean, index: true }, 
});
mongoose.model('Access', Access);

var Workspace = new Schema({
  name           : { type: String, lowercase: true, unique: true},
  description    : String,
  isActive       : Boolean,
  settings       : { 
    welcomeMessage  : String,
    invoiceTemplate : String,
    longName        : String,
    defaultCountry  : String,
    countryId       : { type: ObjectId, index: true },
  },
  access          : [ Access ],
 
});
mongoose.model('Workspace', Workspace);


var City = new Schema({
  workspaceId        : { type: ObjectId, index: true },
  description        : { type: String, index: true },
});
mongoose.model('City', City);


// **********************
// CONTACT AND PRODUCTS
// **********************

var Contact = new Schema({
  workspaceId        : { type: ObjectId, index: true },
  isReseller         : { type: Boolean, index: true },
  isBookable           : { type: Boolean, index: true },
  createdTime        : { type: Date, index: true },
  productIds         : [ { type: ObjectId, index: true}],
  firstName          : { type: String, index: true },
  middleName         : { type: String, index: true },
  lastName           : { type: String, index: true },
  email              : { type: String, index: true },
  address1           : String,
  address2           : String,
  town               : String,
  state              : String,
  postcode           : { type: String, index: true },
  country            : { type: ObjectId, index: true },
  landLineNumber1    : { type: String, index: true },
  landLineNumber2    : { type: String, index: true },
  mobileNumber       : { type: String, index: true },
  ownerUserId        : { type: ObjectId, index: true },
  createdByUserId    : { type: ObjectId, index: true },
});
mongoose.model('Contact', Contact);


var Product = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  cityIds           : [ObjectId],
  description       : String,
  longDescription   : String,
  minimumPrice      : Number,
  maximumPrice      : Number,
  markup            : Number,
  isTimed           : Boolean,
  timedTimeUnit     : { type: String, enum:['minute', 'hour', 'day']},
  durationMinimum   : Number,
  available         : { type: Boolean, index: true },
  contactId         : { type: ObjectId,  index: true },
  isPublic          : { type: Boolean, index: true },
});
mongoose.model('Product', Product);


var User = new Schema({
  login         : { type: String, unique: true, lowercase: true },
  password      : { type: String },
  email         : { type: String, lowercase:true },
});
mongoose.model('User', User);


var Area = new Schema({
  workspaceId  : { type: ObjectId, index: true },
  name         : String,
  parentAreaId : { type: ObjectId, index: true },
});
mongoose.model('Area', Area);


// **************************
//  PAYMENTS AND ACCOUNTING
// **************************

var PaymentType = new Schema({
  workspaceId           : { type: ObjectId, index: true },
  name                  : String,
  description           : String,
});
mongoose.model('PaymentType', PaymentType);

var PaymentMethod = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  name              : String,
  description       : String, 
  isObsolete        : String, 
});
mongoose.model('PaymentMethod',PaymentMethod);


var Payment = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  bookingId         : { type: ObjectId, index: true },
  paymentMethodId   : { type: ObjectId, index: true },
  paymentTypeId     : { type: ObjectId, index: true },
  receivedOn        : { type: Date, index: true },
  amount            : { type: Number, index: true },
  isForBalance      : { type: Boolean, index: true },
  account           : String,
  notes             : String,
  receipt_code      : String,
  machineCustom1    : String,
  machineCustom2    : String,
});
mongoose.model('Payment',Payment);


// *************** 
// MESSAGES
// ***************

var DeliveryLog = new Schema({
  message       : String,
  teaserCalc    : String,
  addedOn       : Date,
});
//
var Message = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  subsystem         : { type: String, enum: ['sms', 'email'] },
  subject           : String,
  body              : String,
  sentByUserId      : ObjectId,
  SentOn            : { type: Date, index: true },
  isDelivered       : { type: Boolean, index: true },
  deliveryLog       : [DeliveryLog],
});
mongoose.model('Message',Message);
  

var MessageTemplate = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  subsystem         : { type: String, enum: ['sms', 'email'], index: true },
  name              : String,
  subject           : String,
  body              : String,
  availableIn       : [ {type: String, enum:['customer_invoice', 'performer_emerg', 'performer_direct',  'customer_status','contact_direct' ], index: true} ],
});
mongoose.model('MessageTemplate',MessageTemplate);


// *************** 
//  THE BOOKING
// ***************

var BookingPossibleStatus = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  description       : { type: String, unique: true }
});
mongoose.model('BookingPossibleStatus',BookingPossibleStatus);

var BookedContactPossibleStatus = new Schema({
  workspaceId       : { type: ObjectId, index: true },
  description       : { type: String, unique: true },
  isRed            : { type: Boolean, index: true },
});
mongoose.model('BookedContactPossibleStatus',BookedContactPossibleStatus);


var Note = new Schema({
  description     : String,
  createdOn       : { type: Date, index: true },
  ownerUserId     : { type: ObjectId, index: true },
});
//
var Booking = new Schema({
  workspaceId        : { type: ObjectId, index: true },
  cityId             : ObjectId,
  description        : String,
  privateDescription : String,
  status             : { type: String, index: true },
  isRed              : { type: Boolean, index: true },
  clientContactId    : { type: ObjectId, index: true },
  hasGuests          : { type: Boolean,   index: true },
  isCancelled        : { type: Boolean, index: true },
  resellerContactId  : { type: ObjectId, index: true },
  ownerUserId        : { type: ObjectId, index: true },
  createdOn          : { type: Date, index: true },
  notes              : [Note],
  //
  firstBookingDateCalc: { type: Date, index: true },
  moneyOwedCalc       : Number,
  moneyPayedCalc      : Number,
  moneyTotalCalc      : Number,
  //
  paymentMethodId    : { type: ObjectId, index: true },
  paymentFlow        : { type: Number, enum: [0,1,2] }, // 0=All to Office 1 = Cash on day 2 = Deposit to Office
  cashToContactId    : { type: ObjectId, index: true },
  //
  textForClient      : String,
  travelDistance     : Number,  
  //
  //
  extraInfo          : { any: {} },
});
mongoose.model('Booking', Booking);


var Preference = new Schema({
  contactId     : { type: ObjectId, index: true },
  isContacted   : { type: Boolean, index: true },
  answer        : String,
});
//
var BookedContact = new Schema({
  workspaceId         : { type: ObjectId, index: true },
  bookingId           : { type: ObjectId, index: true },
  bookedContactId     : { type: ObjectId, index: true },
  preferences         : [Preference],
  status              : { type: String, index: true },
  //
  isNoshow            : { type: Boolean, index: true },
  customerRating      : { type: Number, index: true },
  ratedOn             : { type: Date, index: true },
  customerComment     : String,
  commentedOn         : { type: Date, index: true },
});
mongoose.model('BookedContact',BookedContact);

var BookedProduct = new Schema({
  workspaceId         : { type: ObjectId, index: true },
  bookingId           : { type: ObjectId, index: true },
  bookedContactId     : { type: ObjectId, index: true },
  startDate           : { type: Date, index: true },
  endDate             : { type: Date, index: true },

  moneyToContact      : Number,
  moneyToOffice       : Number,
  moneyToReseller     : Number,
  
  description         : String,
});
mongoose.model('BookedProduct', BookedProduct);




