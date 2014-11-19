define([
  "dojo/_base/declare"


, "dgrid/OnDemandList"
, "dgrid/OnDemandGrid"
, "dgrid/Selection"
, "dgrid/Keyboard"
, "dgrid/extensions/DijitRegistry"
, "dgrid/extensions/DnD"
, "dgrid/extensions/Pagination"

], function(
  declare

, OnDemandList
, OnDemandGrid
, Selection
, Keyboard
, DijitRegistry
, DnD
, Pagination

){

  var r = {};
  r.FullOnDemandList = declare( [ OnDemandList, Selection, Keyboard, DijitRegistry, DnD ] );
  r.FullOnDemandGrid = declare( [ OnDemandGrid, Selection, Keyboard, DijitRegistry, DnD ] );
  
  r.FullOnDemandListNoDnd = declare( [ OnDemandList, Selection, Keyboard, DijitRegistry ] );
  r.FullOnDemandGridNoDnd = declare( [ OnDemandGrid, Selection, Keyboard, DijitRegistry ] );

  return r;
});
