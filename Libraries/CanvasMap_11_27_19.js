//CanvasMap/js/CMBase.js
/******************************************************************************************************************
* CMBase
* This class provides basic support for objects that appear in the table of contents (TOC).
*
* - Selecting and unselecting
* - Settings
* - Containing children and being contained by a parent object
* - Listeners
*
* @module CMBase
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/

//*****************************************************************************************************************
// Global Definitions
//*****************************************************************************************************************
/**
* Types of objects that are used through out CanvasMap.
*
* @public, @enum
*/
CMBase.DATA_TYPE_COORDINATES=1; // coordinates as lat/lon or easting/northing
CMBase.DATA_TYPE_COLOR=2; // 
CMBase.DATA_TYPE_INTEGER=3;
CMBase.DATA_TYPE_BOOLEAN=4;
CMBase.DATA_TYPE_FLOAT=5;
CMBase.DATA_TYPE_CSS_STYLE=6; // 
CMBase.DATA_TYPE_ENUMERATED=7; // 
CMBase.DATA_TYPE_URL=8; // 
CMBase.DATA_TYPE_STRING=9; // 
CMBase.DATA_TYPE_IMAGE=10; // 
CMBase.DATA_TYPE_FONT=11; // 
CMBase.DATA_TYPE_BOUNDS=12; // bounds objects with XMin,YMin,XMax,YMax 

CMBase.DATA_TYPE_BOOLEAN_ARRAY=13; // 
CMBase.DATA_TYPE_VECTOR=14; // x,y and optional z value

/** This is the unique number that is used to create message values
* @private
*/
CMBase.UniqueNumber=1;

//*****************************************************************************************************************
// Constructors
//*****************************************************************************************************************
/**
* Constructor for a base object.   The base object is inherited by most objects and provides function definitions
* for:
* - Child (contained) objects
* - Parent (container) objects
* - Messaging to listeners
* - Basic settings 
*
* CMBase also contains static functions to generate unique numbers for definitions that are shared between classes
*
* @public, @constructs
*/
function CMBase() 
{
}
//******************************************************************
// Protected Functions
//******************************************************************
/**
* Error hangling function for when an unknown Group or Key are specified
* @protected
*/
CMBase.prototype.SettingsError=function(Group,Key)
{
	//var ClassName=this.constructor.name; // jjg does not work, we have to wait for IE to get real class support
				
	if (Key==undefined)
	{
		CMMainContainer.Error("Sorry, we could not find the settings Group '"+Group+"'");
	}
	else
	{
		CMMainContainer.Error("Sorry, we could not find the Key '"+Key+"' in the Group '"+Group+"'");
	}
}

//******************************************************************
// Functions overriden by subclasses
//******************************************************************
/*
* Gets the current name of the object
* @public
* @returns Name - the name of this object
*/
CMBase.prototype.GetName=function()  { return("Untitled"); }

/*
* Adds an entry to the child array
* @public
* @param TheObject -
*/
CMBase.prototype.AddChild=function(TheObject)  
{ 
	if (this.TheChildren==undefined) this.TheChildren=[];
	
	var Result=this.TheChildren.length; // return the index to the new entry
	
	this.TheChildren.push(TheObject);
	
	TheObject.SetParent(this);
	
	return(Result);
}
/*
* Adds an entry to the child array
* @public
* @param TheObject -
*/
CMBase.prototype.RemoveChild=function(Index)  
{ 
	if (typeof(Index)!="number") Index=this.GetChildIndex(Index);
		
	if (Index!=-1)
	{
		var TheObject=this.GetChild(Index);
		
		this.TheChildren.splice(Index,1);
	
		TheObject.SetParent(null);
	}
	return(Index);
}
/*
* Gets the number of children the object contains.
* @public
* @param TheClass - optional class to filter the children
* @returns NumChildren - the number of children contained in this object.
*/
CMBase.prototype.GetNumChildren=function(TheClass)  
{ 
	var Result=0;
	
	if (this.TheChildren!=undefined)
	{
		if (TheClass==undefined) 
		{
			Result=this.TheChildren.length;
		}
		else
		{
			for (var i=0;i<this.TheChildren.length;i++)
			{
				if (this.TheChildren[i] instanceof TheClass) Result++;
			}
		}
	}
	return(Result); 
}

/*
* Gets a child from the object
* @public
* @param Index - zero-based index to the desired child.  If not provided, the first entry is returned.
* @param TheClass - optional class to filter the children
* @returns TheChild - the child object contained within this object.
*/
CMBase.prototype.GetChild=function(Index,TheClass)  
{ 
	var Result=null;
	
	if (this.TheChildren!=undefined)
	{
		if (Index==undefined) Index=0;
		
		if (TheClass==undefined) 
		{
			Result=this.TheChildren[Index];
		}
		else
		{
			var TempIndex=0;
			for (var i=0;(i<this.TheChildren.length)&&(Result==null);i++)
			{
				if (this.TheChildren[i] instanceof TheClass)
				{
					if (TempIndex==Index) Result=this.TheChildren[i];
					TempIndex++;
				}
			}
		}
	}
	return(Result); 
}
/*
* Return the index for the specified child object.  If the 
* child does not appear in the CMScene, return -1
* @public
* @param TheChild - 
* @returns ChildIndex
*/
CMBase.prototype.GetChildIndex=function(TheChild) 
{
	var Result=-1;
	
	if (this.TheChildren!=undefined)
	{
		for (var i=0;i<this.TheChildren.length;i++)
		{
			if (this.TheChildren[i]==TheChild) Result=i;
		}
	}
	return(Result);
}

/*
* Gets the total number of descendants that are in this object.  This includes
* direct children, their children, and so on.
* @public
* @param Index - zero-based index to the desired child
* @param TheClass - optional class to filter the children
* @returns TheChild - the child object contained within this object.
*/
CMBase.prototype.GetNumDescendants=function(TheClass)
{
	var NumDescendants=0; // 
	
	var NumChildren=this.GetNumChildren(TheClass);
	
	for (var i=0;i<NumChildren;i++)
	{
		NumDescendants+=1; // one for this child
		
		 var TheChild=this.GetChild(i);
		
		NumDescendants+=TheChild.GetNumDescendants(TheClass); // add the childs descendents
	}
	return(NumDescendants);
}
/**
* Returns a descendent of this object.
* @public
* @param Index - 0 this object's first child, 2 for this objects first grandchild or second child, etc.
* @param CurrentRow - optional parameter for the row we are current looking for a descendent on.
*/
CMBase.prototype.GetDescendant=function(Index,CurrentRow)
{
	var TheObject=null;
	
	if (CurrentRow==undefined) CurrentRow=0; // just getting started
	
	{
		var NumChildren=this.GetNumChildren();
		
		for (var i=0;(i<NumChildren)&&(TheObject==null);i++)
		{
			if (CurrentRow==Index)// found the right child
			{ 
				TheObject=this.GetChild(i);
			}
			else // see if this one of the childs descendants
			{
				var TheChild=this.GetChild(i);
				
				var NumDescendants=TheChild.GetNumDescendants();
				
				if (NumDescendants+CurrentRow>=Index) // the desired descenent is in this child
				{
					TheObject=TheChild.GetDescendant(Index,CurrentRow+1);
				}
				else // go to the next child
				{
					CurrentRow+=NumDescendants;
				}
			}
			// move to the next child
			CurrentRow++; 
		}
	}
	return(TheObject);
}
/*
* Sets the parent that this object is contained in.
* @protected
* @param NewParent - the new parent that this object is contained within
*/
CMBase.prototype.SetParent=function(NewParent)  
{ 
	this.TheParent=NewParent;
}
/*
* Gets the parent that this object is contained in.
* @protected
* @returns TheParent - the parent this object is within
*/
CMBase.prototype.GetParent=function(Class)  
{ 
	var Result=null;
	
	if (this.TheParent!=undefined) 
	{
		if (Class!=undefined)
		{
			if (this.TheParent instanceof Class) Result=this.TheParent;
			else 
			{
				try{
					
					Result=this.TheParent.GetParent(Class);
				}
				catch(Error) {
					throw(Error);
				}
			}
		}
		else
		{
			if (this.TheParent!=undefined) Result=this.TheParent;
		}
	}
	return(Result); 
}
/**
* General function to send a message to all the descendents of an object.
* Used to send event messages to children.
* @public
*/
CMBase.prototype.SendMessageToDescendants=function(Message,AdditionalInfo)  
{ 
	var Used=false;
	
	var NumChildren=this.GetNumChildren();
	
	for (var i=0;(i<NumChildren)&&(Used==false);i++)
	{
		var TheChild=this.GetChild(i);
		
		Used=TheChild.SendMessageToDescendants(Message,AdditionalInfo);
	}
	return(Used);
}

//******************************************************************
// Listener functions
//******************************************************************
/**
* Add a listener to listen for messages from this object.  Messages are
* delivered with the function call:
*
* TheFunction(TheSender,TheListener,AdditionalInfo)
*
* TheFunction will receive the messages when sent by TheSender.  TheListener
* is the object that added itself as the listener so the function can access
* its properties.  AdditionaInfo is provided by the sender based on the type of message.
*
* @public
* @param TheFunction - The function that will listen to messages
* @param TheMessage - The message number the object wants to listen to
* @param TheListener - The object that will receive messages from this object.
* @returns UniqueNumber - returns a unique number for the function that has been added so it can be removed easily.
* 	This avoids the problem with addEventListener() that you have to have a uniquely named function outside the class.
*/
CMBase.prototype.AddListener=function(TheMessage,TheListener,TheFunction)
{
	if (TheMessage==undefined) 
	{
		throw("Sorry, the message is undefined");
	}
	if (this.Listeners==undefined) this.Listeners=[];
	
	if (this.Listeners[TheMessage]==undefined) this.Listeners[TheMessage]=[];
	
	var UniqueNumber=CMBase.GetUniqueNumber();
	
	this.Listeners[TheMessage].push(
	{
		TheFunction:TheFunction,
		TheListener:TheListener,
		UniqueNumber:UniqueNumber
	});
	
	return(UniqueNumber);
}
/**
* Removes a listener from the list of listeners
* @public
* @param TheMessage - The message that the listener was listening for
* @param UniqueNumber - the unique number that was generated when the listener was added.
*/
CMBase.prototype.RemoveListener=function(TheMessage,UniqueNumber)
{
	if (this.Listeners!=undefined)
	{		
		var TheListeners=this.Listeners[TheMessage];
		
		for (var i=0;i<TheListeners.length;i++)
		{
			if (TheListeners[i].UniqueNumber==UniqueNumber)
			{
				TheListeners.splice(i,1);
			}
		}
	}
}
/**
* Removes a listener from the list of listeners
* @public
* @param TheMessage - The message to send
* @param AdditionalInfo - additional information based on the message type
*/
CMBase.prototype.SendMessageToListeners=function(TheMessage,AdditionalInfo)
{
	if (TheMessage==undefined)
	{
		throw("Sorry, the message is undefined");
	}
	// make sure we have listeners and we are not sending to ourselves (stops infiinite message loops)
	
	if (this.Listeners!=undefined) 
	{	
		var TheListeners=this.Listeners[TheMessage];
		
		if (TheListeners!=undefined)
		{
			for (var i=0;i<TheListeners.length;i++)
			{
				var TheListener=TheListeners[i].TheListener;
				
				TheListeners[i].TheFunction(this,TheListener,AdditionalInfo);
			}
		}
	}
}

//******************************************************************
// Functions for managing settings and timeslices
//******************************************************************
/**
* Returns the specified Group settings.  If the group has not allocated will return an empty
* dictionary.  If the group is not defined, will general an error
* @protected
*/
CMBase.prototype.GetGroupFromSettings=function(GroupKey,Settings)
{
	var GroupSettings=Settings[GroupKey];
	
	if (GroupSettings==undefined) // if the group is not in the current settings, see if the group is defined
	{
		var SettingsDefinitions=this.GetSettingsDefinitions();
		
		var GroupDefinitions=SettingsDefinitions[GroupKey];
		
		if (GroupDefinitions!=undefined) // if the group is defined, try to set the values with the keys
		{
			GroupSettings={};
			Settings[GroupKey]=GroupSettings;
		}
		else this.SettingsError(GroupKey);
	}
	return(GroupSettings);
}

/**
* Override the GetSettingsDefinition() function to add our settings definitions
* Combined with our superclass's settings definitions.  Each sub class
* should add their settings definitions to the JSON object with the class's
* name as the key.
* @protected
*/
CMBase.prototype.GetSettingsDefinitions=function() 
{
	var Result={ }; 
	
	return(Result); // eventually, this will return a JSON object with objects for each superclass's settings definitions
}
/**
* Called when any settings are changed.
* @protected
*/
CMBase.prototype.SettingsChanged=function() 
{
}
/**
* Get a set of settings.  
* @public
* @returns Settings - current settings object (may be undefined)
*/
CMBase.prototype.GetSettings=function()
{
	return(this.Settings);
}
/**
* Sets all the settings for this object.  
* @public
* @param NewSettings - The settings to replace the existing settings.
*/
CMBase.prototype.SetSettings=function(NewSettings)
{
	this.Settings=NewSettings;
	
	this.SettingsChanged();
	
	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}

/**
* Returns the specified Group settings.  If the group has not allocated will return an empty
* dictionary.  If the group is not defined, will general an error (jjg - Probably being depricated as Set() can be used in the same way).
* @protected
*/
CMBase.prototype.SetSettingGroup=function(GroupKey,GroupSettings)
{
	if (this.Settings==undefined) this.Settings={};
	
	this.Settings[GroupKey]=GroupSettings;
	
	this.SettingsChanged();
	
	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}
/**
* Get a group of settings.  Does not check for errors and the returned result could be undefined.
* @public
* @param Group - Group for the setting
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - currnet group entry or undefined.
*/
CMBase.prototype.GetSettingGroup=function(Group)
{
	var Result=this.Settings[Group];

	return(Result);
}

/**
* Sets a set of settings for this object.  The TimeSlice must already exist within the object.
* @public
* @param NewSettings - The settings to replace the existing settings.
*/
CMBase.prototype.GetSetting=function(Group,Key,Default)
{
	var Result=null; //this.SettingDefintions[Group][Key].Default;
	
	if (Default!=undefined) Result=Default;

	//if (this.Settings!=undefined)
	{
		var GroupSettings;
		
		// try to get the settings from the current object settings
		if (this.Settings!=undefined) GroupSettings=this.Settings[Group];
		
		if (GroupSettings!=undefined) // group has not been defined yet
		{
			if (Key in GroupSettings) Result=GroupSettings[Key];
		}
		// if we could not find a setting value and the default was not provided, get the default from the definitions
		if (Result==null) 
		{
			var SettingsDefinitions=this.GetSettingsDefinitions();
			
			if (Group in SettingsDefinitions)
			{
				var GroupDefinitions=SettingsDefinitions[Group];
				
				if (Key in GroupDefinitions) 
				{
					var Temp=GroupDefinitions[Key];
					var Result=Temp.Default;
				}
				else this.SettingsError(Group,Key);
			}
			else this.SettingsError(Group);
		}
	}
	return(Result);
}

/**
* Sets a set of settings for this object. ct.
* @public
* @param Group - The settings to replace the existing settings.
*/
CMBase.prototype.SetSetting=function(Group,Key,Value)
{
	// put the settings into a dictionary entry
	if (this.Settings==undefined) this.Settings={};
	
//	var TheEntry={[Group]:{[Key]:Value}}; // weird but it works!
//	TheEntry[Group]={};
//	TheEntry[Group][Key]=Value;
	
	if (this.Settings[Group]!=undefined) // group is in current settings
	{
		if (Key in this.Settings[Group]) // key is in current settings
		{
			this.Set({[Group]:{[Key]:Value}});
//			this.Settings[Group][Key]=Value; // replace the current value
		}
		else // make sure the key is in the definitions and then add it
		{
			var SettingsDefinitions=this.GetSettingsDefinitions();
			
			var GroupDefinitions=SettingsDefinitions[Group];
			
			if (GroupDefinitions!=undefined) // group is in the group definitions
			{
				if (Key in GroupDefinitions)  // check if the key is in the definitions
				{
					this.Set({[Group]:{[Key]:Value}});
//					this.Settings[Group][Key]=Value; // add the new value
				}
				else this.SettingsError(Group,Key);
			}
			else this.SettingsError(Group);
		}
	}
	else // group is not in current settings
	{
		var SettingsDefinitions=this.GetSettingsDefinitions();
		
		var GroupDefinitions=SettingsDefinitions[Group];
			
		if (GroupDefinitions!=undefined) // group is in the group definitions
		{
			if (Key in GroupDefinitions)   // check if the key is in the definitions
			{
//				this.Settings[Group]={}; // add the new group
				this.Set({[Group]:{[Key]:Value}});
//				this.Settings[Group][Key]=Value; // add the new value
			}
			else this.SettingsError(Group,Key);
		}
		else this.SettingsError(Group);
	}
	// notify decendents of the settings change
//	this.SettingsChanged();
	
	// notify colleagues of the settings change
//	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}
/**
* High performance funtion to set settings into the existing Settings
* dictionary.  This function should be used when speed and not error
* checking are needed.  For ENUMEATED arrays, Values are integers. 
*
* This is the function that should be overriden by subclasses
* @protected
* @param Dictionary - Contains groups of settings based on SettingsDefinitions for this class.
*/
CMBase.prototype.Set=function(Dictionary)
{
	if (this.Settings==undefined) this.Settings={};
	
	for (var GroupKey in Dictionary) 
	{
		if (this.Settings[GroupKey]==undefined) // copy the entire group
		{
			this.Settings[GroupKey]=Dictionary[GroupKey];
		}
		else
		{
			var Group=Dictionary[GroupKey];
			
			for (var SettingsKey in Group)
			{
				this.Settings[GroupKey][SettingsKey]=Group[SettingsKey];
			}
		}
	}
	
	this.SettingsChanged();
	
	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}

//******************************************************************
// static functions
//******************************************************************
/**
* Gets an integer that is unique for this instance of CanvasMap.  This is
* used to ensure that all messages have a unique value.
* @public
* @returns UniqueNumber unique integer
*/
CMBase.GetUniqueNumber=function() 
{
	CMBase.UniqueNumber++;
	return(CMBase.UniqueNumber-1);
}
/**
* Types of messages
* @protected
*/
CMBase.MESSAGE_SETTINGS_CHANGED=CMBase.GetUniqueNumber();


//CanvasMap/js/CMUtilities.js
/****************************************************************************************************
* CMUtilities Class
*
* General utilities.
*
* @module CMUtilities
* @Copyright HSU, Jim Graham, 2019
****************************************************************************************************/
//****************************************************************************************************
// Constructor so we can add static definitions
//****************************************************************************************************
/**
* Constructor so we can add static definitions
*
* @public, @constructs
*/
function CMUtilities() 
{
	
}
//****************************************************************************************************
// Definitions
//****************************************************************************************************
/**
* Units to display in the footer.  
* @public, @enum
*/
CMUtilities.COORDINATE_UNITS_DD=0;
CMUtilities.COORDINATE_UNITS_DMS=1;
CMUtilities.COORDINATE_UNITS_METERS=2;
CMUtilities.COORDINATE_UNITS_FEET=3;
CMUtilities.COORDINATE_UNITS_PIXELS=4; // displays the pixel level coordinates for debugging
CMUtilities.COORDINATE_UNITS_ZOOM=5; // displays the zoom level for debugging

CMUtilities.QUANTILES=1;

//****************************************************************************************************
// Private functions
//****************************************************************************************************
/**
* Converts the value into a two digit hexadecimal string.  The first
* character will be a 0 if the value is less than 10 hex.
* @private
*/
CMUtilities.GetTwoDigitHex=function(Value)
{
	var Red=parseInt(Value);
	var Red=Red.toString(16);
	if (Red.length<2) Red="0"+Red;
	return(Red);
}
/**
* returns rgb() color from a named color (e.g. "yellow")
* @private
*/
CMUtilities.GetRGBColorFromNamedColor=function(NamedColor) 
{
    // Add a temporary div to the body
    var TempDiv=$("<div></div>").appendTo("body").css("background-color",NamedColor);
    
	// Get the style computed by the browser
	var TheComputedStyle=window.getComputedStyle(TempDiv[0]);

    // Get the rgb color
    var ComputedRGB = TheComputedStyle.backgroundColor;

	// remove the temp div
    TempDiv.remove();

    return(ComputedRGB);
};
/**
* Returns an array that contains the individual rgb and opacity values 
* @private
* @param Value - Value can be of the format "rgb(255,255,255)" or "255,255,255".
* from a color
*/
CMUtilities.GetRGBAValuesFromRGBA=function(Value)
{
	// setup the default to be black
	var Result={
		Red:255,
		Green:255,
		Blue:255,
		Transparency:1 // 1 for opaque, 0 for transparent
	};
	
	if ((typeof(Value)!="undefined")) // convert from rgb or rgba to hex
	{
		if (Value.indexOf("rgb")>-1)
		{
			var Index=Value.indexOf("(");
			Value=Value.substring(Index+1);
		
			Index=Value.indexOf(")");
			Value=Value.substring(0,Index);
		}
		var Tokens=Value.split(",");
		
		Result.Red=parseFloat(Tokens[0]);
		Result.Green=parseFloat(Tokens[1]);
		Result.Blue=parseFloat(Tokens[2]);
		
		if (Tokens.length>3)
		{
			Result.Transparency=parseFloat(Tokens[3]);
		}
	}
	return(Result);
}
/**
* @private
*/
CMUtilities.GetHexFromRGB=function(Value)
{
	var Result=CMUtilities.GetRGBAValuesFromRGBA(Value);

	var Red=CMUtilities.GetTwoDigitHex(Result.Red);
	var Green=CMUtilities.GetTwoDigitHex(Result.Green);
	var Blue=CMUtilities.GetTwoDigitHex(Result.Blue);
	
	Value="#"+Red+Green+Blue;
	
	return(Value);
}
//****************************************************************************************************
// Public utilites
//****************************************************************************************************
/*
* Check if the element is defined (could be null or "undefined").
* @param TheValue - the value to check
* @returns Flag
*/
CMUtilities.IsDefined=function(TheElement)
{
	var Result=true;
	
	if ((TheElement==undefined)||(TheElement==null)) Result=false;
	
	return(Result);
}
/*
* Make an element be positioned abosolutely
* @public
* @param TheElement - the DOM element to position
* @param Left - left position in pixels 
* @param Top - Top position in pixels 
* @param Width - Width in pixels 
* @param Height - Height in pixels 
*/
CMUtilities.AbsolutePosition=function(TheElement,Left,Top,Width,Height)
{
	TheElement.style.position="absolute";
	
	TheElement.style.left=Left+"px";
	TheElement.style.top=Top+"px";
	TheElement.style.width=Width+"px";
	TheElement.style.height=Height+"px";
}
/**
* Creates popup menu
* @protected
* @returns ThePopupMenu - Popup menu at the specified location
*/
CMUtilities.GetPopupMenu=function(ClassName,ClientX,ClientY)
{
	var ThePopupMenu=document.getElementById("LayerPopupMenu");
	if (ThePopupMenu==null)
	{
		ThePopupMenu=document.createElement("DIV"); // create the DIV element
		ThePopupMenu.className=ClassName;
		
		ThePopupMenu.id="LayerPopupMenu"; // set the ID so we can get it back
	
		document.body.appendChild(ThePopupMenu); // add the dialog element to the document
	}
	// remove all the elements from the popup menu
	while (ThePopupMenu.firstChild) // while there is a first element in the dialog
	{
		// removing the first element moves the next element to the first position
		// so this little loop will remove all the elements from another element
		ThePopupMenu.removeChild(ThePopupMenu.firstChild);
	}
	this.ThePopupMenu=ThePopupMenu;
	
	ThePopupMenu.style.position="absolute";

	ThePopupMenu.style.left=ClientX+"px";
	ThePopupMenu.style.top=ClientY+"px";
	
	CMMainContainer.AddPopupWindow(ThePopupMenu); // reset any existing popups and make this one current
	
	ThePopupMenu.style.visibility="visible"; // make this popup visible

	return(ThePopupMenu);
}
//***************************************************************************************
// Class and Utilities functions for working with HTML 5
// Canvas DOM elements.
//***************************************************************************************
/*
* Moves the global coordinate to be local with the specified element
* @public
* @returns Coordinate - Global coordinate as {x,y}
*/
CMUtilities.GetElementCoordinate=function(ClientX,ClientY,Canvas)
{
	if (Canvas==null)
	{
		var j=12;
	}
	var rect=Canvas.getBoundingClientRect();
        
	var Coordinate=
	{
		x: Math.round(ClientX-rect.left),
		y: Math.round(ClientY-rect.top)
	}
	return(Coordinate);
} 
//******************************************************************
// Color value untilities
//******************************************************************
/**
* Returns a CSS color defined by HSL.  Hue goes from 0 to 360 degrees around a color
* wheel.  Saturation makes the colors brighter (more distinct from each other) while
* Lumniosity or lightness controls how bright the colors are
*
* @param h - 0 to 360 for hue (0=red, 60=yellow, 120=green, 180=cyan, 240=blue, 300=purple
* @param s - saturation (0=no hue, 1=most separated hues)
* @param l - luminocity (0=black, 1=white, 0.5=brightest colors)
* @returns HSL 
*/ 
CMUtilities.GetCSSHSL=function(h,s,l)
{
	return("hsl(240,"+50+"%,"+80+"%)");
}
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * 
 * from: https://gist.github.com/mjackson/5311256
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 *
 */
// This code is based on https://en.wikipedia.org/wiki/HSL_and_HSV
// Free to use for any purpose. No attribution needed.
/*
CMUtilities.RGBToHSL=function(r, g, b) 
{
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let d = max - min;
  let h;
  if (d === 0) h = 0;
  else if (max === r) h = (g - b) / d % 6;
  else if (max === g) h = (b - r) / d + 2;
  else if (max === b) h = (r - g) / d + 4;
  let l = (min + max) / 2;
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h * 60, s, l];
}*/
/**
* @param h - 0 to 360 for hue (0=red, 60=yellow, 120=green, 180=cyan, 240=blue, 300=purple
* @param s - saturation (0=no hue, 1=most separated hues)
* @param l - luminocity (0=black, 1=white, 0.5=brightest colors)
* @returns RGB 
*/
CMUtilities.HSLToRGB=function(h, s, l) 
{
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let hp = h / 60.0;
  let x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb1;
  if (isNaN(h)) rgb1 = [0, 0, 0];
  else if (hp <= 1) rgb1 = [c, x, 0];
  else if (hp <= 2) rgb1 = [x, c, 0];
  else if (hp <= 3) rgb1 = [0, c, x];
  else if (hp <= 4) rgb1 = [0, x, c];
  else if (hp <= 5) rgb1 = [x, 0, c];
  else if (hp <= 6) rgb1 = [c, 0, x];
  let m = l - c * 0.5;
  return [
    Math.round(255 * (rgb1[0] + m)),
    Math.round(255 * (rgb1[1] + m)),
    Math.round(255 * (rgb1[2] + m))];
}

/**
* Returns a hex color from another color.
* Used to set the color in a color control.
* Must convert all colors types to hex.
* @protected
* @returns HexColor
*/
CMUtilities.GetHexColorFromColor=function(Value)
{
	if (Value!=undefined)
	{
		Value=""+Value; // make sure the value is a string
		
		if (Value.indexOf("rgb")>-1) // rgb(0,0,0) or rgba(0,0,0,0)
		{
			Value=CMUtilities.GetHexFromRGB(Value);
		}
		else if ((Value.charAt(0)>='0')&&(Value.charAt(0)<='9')) // 255,255,255
		{
			Value=CMUtilities.GetHexFromRGB(Value);
		}
		else if (Value.indexOf("#")==-1) // must be a text color? 
		{
			Value=CMUtilities.GetRGBColorFromNamedColor(Value);
			Value=CMUtilities.GetHexFromRGB(Value);
		}
	}
	return(Value);
}
/** Returns an RGB color from a hex color.
* This is only called by CMDialog.js to convert
* the colors from the control to RGB
* @protected
* @returns RGB
*/
CMUtilities.GetRGBFromHex=function(Value)
{
	var Red=Value.substring(1,3);
	var Green=Value.substring(3,5);
	var Blue=Value.substring(5,7);
	
	var Result={
		Red:parseInt(Red,16),
		Green:parseInt(Green,16),
		Blue:parseInt(Blue,16),
		Transparency:1
	}
	return(Result);
}
/**
* Returns a color in the most general format: rgba(0,0,0,1) no matter 
* what CSS format is used (i.e. rgb, rgba, hex, color name).  Also
* supports a simple 255,255,255 format.
* @protected
* @returns Color - formated as {Red,Green,Blue,Transparency}
*/
CMUtilities.GetColorsFromAnyColor=function(Value,Transparency)
{
	// setup a default set of colors
	var Colors={
			Red:255,
			Green:255,
			Blue:255,
	};
	// modify the default based on the specified colors
	if (Value!=undefined)
	{
		Value=""+Value; // make sure value is a string
		
		// override the default based on the specified values
		if (Value.indexOf("rgb")>-1)
		{
			Colors=CMUtilities.GetRGBAValuesFromRGBA(Value)
		}
		else if ((Value.charAt(0)>='0')&&(Value.charAt(0)<='9')) // 255,255,255
		{
			var Tokens=Value.split(",");
			
			Colors.Red=parseFloat(Tokens[0]);
			Colors.Green=parseFloat(Tokens[1]);
			Colors.Blue=parseFloat(Tokens[2]);
			
			if (Tokens.length>3) { Colors.Transparency=parseFloat(Tokens[3]); }
		}
		else if (Value.indexOf("#")!=-1) // hex color
		{
			Colors=CMUtilities.GetRGBFromHex(Value);
		}
		else if (Value.indexOf("#")==-1) // must be a text color?
		{
			var RGBColor=CMUtilities.GetRGBColorFromNamedColor(Value);
			Colors=CMUtilities.GetRGBAValuesFromRGBA(RGBColor);
		}
		// use the specified transparency
		
		if (Transparency!=undefined) Colors.Transparency=Transparency;
	}
	return(Colors);
}
/**
* Returns a color in the most general format: rgba(0,0,0,1) no matter 
* what CSS format is used (i.e. rgb, rgba, hex, color name).  Also
* supports a simple 255,255,255 format.
* @protected
* @returns RGBA
*/
CMUtilities.GetRGBAFromAnyColor=function(Value,Transparency)
{
	var Colors=CMUtilities.GetColorsFromAnyColor(Value,Transparency);
	
	// create the final result
	
	var Value=null;
	
	if (Colors.Transparency==undefined)
	{
		Value="rgb("+Colors.Red+","+Colors.Green+","+Colors.Blue+")";
	}
	else
	{
		Value="rgba("+Colors.Red+","+Colors.Green+","+Colors.Blue+","+Colors.Transparency+")";
	}
	return(Value);
}

//**************************************************************

/**
* Creates an array of colors from a set of feature values, a set of colors, and defined intervals.
* The returned result 
* Used to create legends.  
* @public
* @param FeatureValues - array of values for the features, typically from an attribute
* @param TheColors - array of colors for the FeatureValues
* @param Intervals - optional array of intervals that bracket the colors.  If not specified, the intervals will be defined to cover the range of FeatureValues
* @returns Colors - { LegendLabels,FeatureColors} where LegendLabels an array of names appropriate for a legend and FeatureColors is an array to colorize each of the features
*/
CMUtilities.GetColorsFromArrays=function(FeatureValues,TheColors,Intervals)
{
	var TheHistogram=CMUtilities.GetHistogram(FeatureValues,1000);
	
	// setup the red, green, and blue values for the color ramp
	
	var Reds=[];
	var Greens=[];
	var Blues=[];
	
	for (var i=0;i<TheColors.length;i++)
	{
		var Hex=TheColors[i];
		
		var RGB=CMUtilities.GetRGBFromHex(Hex);
		
		Reds[i]=RGB.Red;
		Greens[i]=RGB.Green;
		Blues[i]=RGB.Blue;
	}
	
	// setup an array with styles that include randomly generated colors for the counties
	
	var FeatureColors=[];
	var LegendLabels=[];
	if ((Intervals!=undefined))
	{
/*		if (Intervals==undefined)
		{
			Intervals=CMUtilities.GetQuantiles(TheHistogram,TheColors.length);
		}
*/		for (var i=0;i<FeatureValues.length;i++)
		{
			var Index=0;
			var Value=FeatureValues[i];
			
			while ((Value>Intervals[Index+1])&&(Index<Intervals.length-1)) { Index++; }
			
			if (Index>=Reds.length) Index=Reds.length-1;
			
			var Red=Reds[Index];
			var Green=Greens[Index];
			var Blue=Blues[Index];
			
			var TheColor="rgb("+Red+","+Green+","+Blue+")";
			
			FeatureColors[i]=TheColor;
		}
		for (var i=0;i<Intervals.length;i++)
		{
			LegendLabels[i]=Math.round(Intervals[i])+" to "+Math.round(Intervals[i+1]);
		}
	}
	else
	{
		var Min=TheHistogram.Min;
		var Max=TheHistogram.Max;
		
		var Range=Max-Min;
		for (var i=0;i<FeatureValues.length;i++)
		{
			var Index=0;
			
			if (Range!=0)
			{
				Index=parseInt((FeatureValues[i]-Min)/(Range)*TheColors.length); // convert from 0 to 5
			}		
			var Red=Reds[Index];
			var Green=Greens[Index];
			var Blue=Blues[Index];
			
			var TheColor="rgb("+Red+","+Green+","+Blue+")";
			
			FeatureColors[i]=TheColor;
		}
		for (var i=0;i<TheColors.length;i++)
		{
			var Value1=Min+(i*Range);
			var Value2=Value1+Range;
			
			LegendLabels[i]=Value1+" to "+Value2;
		}
	}
	var Result={
		LegendLabels:LegendLabels,
		FeatureColors:FeatureColors
	}
	return(Result);
};
/**
* Adds a legend to a DOM element.  This is a basic legend and this function may be expanded in the future.
* @public
* @param TheCanvasElement - the element to add the legend to
* @param TheColors - array of colors for the legend
* @param LegendLabels - labels to go next to the legend colors
* @param X,Y,Width,Height - position and dimensions of the legend in pixels
* @returns LegendElement -  a new DOM element.
*/
CMUtilities.AddLegend=function(TheCanvasElement,TheColors,LegendLabels,X,Y,Width,Height)
{
	var Legend=document.createElement("DIV");
	var TheHTML="<div>";
	
	TheHTML+="<table>";
	for (var i=0;i<TheColors.length;i++)
	{
		TheHTML+="<tr>";
		TheHTML+="<td>";
		TheHTML+="<div style='border:solid black 1px;background-color:"+TheColors[i]+";width:12px;height:12px'></div>";
		TheHTML+="</td>";
		TheHTML+="<td>";
		TheHTML+="<div>"+LegendLabels[i]+"</div>";
		TheHTML+="</td>";
		TheHTML+="<tr>";
	}
	TheHTML+="</table>";
	Legend.innerHTML=TheHTML;
	
	TheCanvasElement.appendChild(Legend);
	CMUtilities.AbsolutePosition(Legend,X,Y,Width,Height);
	
	return(Legend);
}

//******************************************************************
// Statistic untilities
//******************************************************************
/**
* Get the mean value for the specified array
* @public
* @param TheArray - array of numeric values
* @returns Mean - average value of the values in the array
*/
CMUtilities.GetMean=function(TheArray)
{
	// get the values and find the min and max
	
	var Sum=0;
	
	for (var i=0;i<TheArray.length;i++)
	{
		Sum+=TheArray[i];
	}
	var Result=Sum/TheArray.length;
	
	return(Result);
};
/**
* Compute the standard deviation for the values in the array
* @public
* @param TheArray - array of numeric values
* @returns StdDev -  standard deviation of the values in the array
*/
CMUtilities.GetStdDev=function(TheArray)
{
	var Mean=CMUtilities.GetMean(TheArray);
	
	var SumSquares=0;
	var Temp;
	
	for (var i=0;i<TheArray.length;i++)
	{
		Temp=TheArray[i]-Mean;
		
		SumSquares+=Temp*Temp;
	}
	var Result=Math.sqrt(SumSquares/(TheArray.length-1));
	
	return(Result);
};

/**
* Get the min and max values from the specified array
* @public
* @param TheArray - array of numeric values
* @returns {Min,Max} 
*/
CMUtilities.GetMinMax=function(TheArray)
{
	// get the values and find the min and max
	
	var Value;
	var Min;
	var Max;
	
	for (var i=0;i<TheArray.length;i++)
	{
		Value=TheArray[i];
	
		if (i==0)
		{
			Min=Value;
			Max=Value;
		}
		else
		{ 
			if (Value<Min) Min=Value;
			if (Value>Max) Max=Value;
		}
	}
	var Result={Min:Min,Max:Max};
	
	return(Result);
};
/**
* Get a histogram with the specified number of bins
* @public
* @param TheArray - array of numeric values
* @param NumBins - array of numeric values
* @returns {Min,Max,Bins,Labels} - a histogram in an object with the keys:
*		Min - minimum value in TheArray
*		Max - max value in the array
*		Bins - array of bins with countes of entries in each bin
*		Labels - labels that can be associated with the bins
*/
CMUtilities.GetHistogram=function(TheArray,NumBins)
{
	var MinMaxes=CMUtilities.GetMinMax(TheArray);
	
	var Min=MinMaxes.Min;
	var Max=MinMaxes.Max;
	var Range=Max-Min;
	
	// setup the result to all zeros (this will be the result if the range is zero (i.e. all values are the same)
	var Bins=[];
	var Labels=[];
	for (var i=0;i<NumBins;i++) 
	{
		Bins[i]=0;
		Labels[i]=Min+(Range*i);
	}
	if (Range!=0)
	{
		var Value;
		for (var i=0;i<TheArray.length;i++)
		{
			Bin=Math.round((TheArray[i]-Min)/Range*NumBins);
			
			if (Bin>=NumBins) Bin=NumBins-1;
			
			Bins[Bin]++;
		}
	}
	var Result={
		Min:Min,
		Max:Max,
		Bins:Bins,
		Labels:Labels
	};
	return(Result);
};
/**
* Quantiles are the breaks in a range of values that divides them into 
* groups that contian an equal number of entries.
* @public
* @param TheHistogram - array of countes
* @param NumGroups - number of groups to contain the same number of entries
* @returns Quantiles - array of quantiles
*/
CMUtilities.GetQuantiles=function(TheHistogram,NumGroups)
{
	var Bins=TheHistogram.Bins;
	
	// Find the total number of entries in the histogram
	var Total=0;
	for (var i=0;i<Bins.length;i++) { Total+=Bins[i]; };
	
	var GroupSize=Total/NumGroups; // number of values in each group
	
	var BinWidth=(TheHistogram.Max-TheHistogram.Min)/NumGroups; // width of each histogram bin
	
	var Quantiles=[];
	Quantiles[0]=TheHistogram.Min;
	
	var NextGroup=GroupSize;
	var CurrentNumber=0;
	for (var i=0;i<Bins.length;i++)
	{
		CurrentNumber+=Bins[i];
		
		if (CurrentNumber>=NextGroup)
		{
			Quantiles.push(TheHistogram.Min+BinWidth*i);
			NextGroup+=GroupSize;
		}
	}
	Quantiles.push(TheHistogram.Max);
	
	return(Quantiles);
};
//******************************************************************
// Array untilities
//******************************************************************
/**
* Reverse the order of the entries in the array.
* @public
* @param TheArray 
* @returns FlippedArray - Array with entries reversed.
*/
CMUtilities.FlipArray=function(TheArray)
{
	var Result=[];
	
	var LastIndex=TheArray.length-1; // for speed
	
	for (var i=0;i<=LastIndex;i++) 
	{
		Result.push(TheArray[LastIndex-i]);
	}
	return(Result);
}
/**
* Sort an array from the lowest to the highest values
* @public
* @param TheArray 
*/
CMUtilities.Sort=function(TheArray)
{
	var Temp;
	var NumEntries=TheArray.length;
	var MadeChange=true;
	while (MadeChange)
	{
		MadeChange=false;
		for (var i=0;i<NumEntries-1;i++)
		{
			if (TheArray[i+1]<TheArray[i])
			{
				Temp=TheArray[i];
				TheArray[i]=TheArray[i+1];
				TheArray[i+1]=Temp;
				
				MadeChange=true;
			}
		}
	}
}

/**
* Adds the specified value into TheArray while keeping the array sorted from lowest to highest value.
* @public
* @param TheArray - an array that is already sorted
* @param TheValue - the numeric value to insert
* @param AllowDuplicates - true to allow duplicate entries
*/
CMUtilities.InsertIntoSortedArray=function(TheArray,TheValue,AllowDuplicates)
{
	if (AllowDuplicates==undefined) AllowDuplicates=false;
	
	var Index=TheArray.indexOf(TheValue);
	
	if (Index!=-1) // already exists
	{
		if (AllowDuplicates) TheArray.splice(Index,0,TheValue);
	}
	else // need to insert the value
	{
		var Index=0;
		while ((Index<TheArray.length)&&(TheArray[Index]<TheValue)) Index++;
		TheArray.splice(Index,0,TheValue);
	}
}
/**
* Compares the two arrays to see if they are identical
* @public
* @param TheArray1 
* @param TheArray2
* @returns Flag - true if the arrays are the same length and have equivalent entries
*/
CMUtilities.ArraysEqual=function(TheArray1,TheArray2)
{
	var Result=false;
	
	if (TheArray1.length==TheArray2.length)
	{
		Result=true;
		
		for (var i=0;i<TheArray1.length;i++)
		{
			if (TheArray1[i]!=TheArray2[i]) Result=false;
		}
	}
	
	return(Result);
}
//******************************************************************
// Polygon untilities
//******************************************************************
/**
 * Returns an array of coordinates for a regular polygon of the specified
 * number of points.
 * @public
 * @param NumPoints - 3 for a triangle, 4 for a square, 5 for a pentagon, etc.
 * @param Size - Distance from the center to each point in the polygon
 * @param CenterX - Center for the polygon
 * @param CenterY
 * @param StartAngle - 0 to have the first point straight up (north), 90 for east, etc.
 * @returns CoordinateArray - Array with first entry as an array of x coordinate values and the second as y coordinate values
 */
CMUtilities.GetRegularPolygon=function(NumPoints,Size,CenterX,CenterY,StartAngle)
{
	var Result=null;

	if (NumPoints>0)
	{
		var	HalfSize=Size/2;
		var	DX,DY;
		var	Radius;
		var	Angle=0;
		var	X,Y;

		var Result=[];
		Result[0]=[];
		Result[1]=[];
		
		var SweepAngle=Math.PI*2/NumPoints; // angle between each point

		StartAngle-=180; // flip to having the point on the top (bottom of the screen)
		
		StartAngle=(StartAngle*Math.PI*2/360); // convert to radians

		Radius=HalfSize/Math.cos(SweepAngle/2); // distance from center to a point

		// setup the first point (polygons always have a flat side on the bottom)

		Angle=StartAngle; // 0 degrees is y=0, x=undefined (moving clockwise)

		for (var i=0;i<NumPoints;i++)
		{
			DX=Radius*Math.sin(Angle); // offset to first point (just to the right of bottom-center
			DY=Radius*Math.cos(Angle);

			Result[0][i]=CenterX+DX;
			Result[1][i]=CenterY+DY;

			Angle+=SweepAngle;
		}
	}
	
	return(Result);
}
/**
 * Returns the shape of a star
 * @public
 * @param NumPoints
 * @param Size
 * @param CenterX
 * @param CenterY
 * @param StartAngle - angle to the first point in degrees (0 is up)
 * @returns CoordinateArray - Array with first entry as an array of x coordinate values and the second as y coordinate values
 */
CMUtilities.GetStar=function(NumPoints,Size,CenterX, CenterY, StartAngle)
{
	var Result=null;

	if (NumPoints>0)
	{
		var	HalfSize=Size/2;
		var	DX,DY;
		var	Radius;
		var	Angle=0;
		var	X,Y;

		Result=[];
		Result[0]=[];
		Result[1]=[];
		
		var SweepAngle=Math.PI*2/NumPoints/2; // angle between each point

		StartAngle-=180; // flip to having the point on the top (bottom of the screen)
		
		StartAngle=(StartAngle*Math.PI*2/360); // convert to radians

		Radius=HalfSize/Math.cos(SweepAngle/2); // distance from center to a point
		var InnerRadius=Radius/2.5;
		
		// setup the first point (polygons always have a flat side on the bottom)

		Angle=StartAngle; // 0 degrees is y=0, x=undefined (moving clockwise)

		for (var i=0;i<NumPoints;i++)
		{
			// move to the outer point
			
			DX=Radius*Math.sin(Angle); // offset to first point (just to the right of bottom-center
			DY=Radius*Math.cos(Angle);

			X=CenterX+DX;
			Y=CenterY+DY;

			Result[0][i*2]=CenterX+DX;
			Result[1][i*2]=CenterY+DY;

			Angle+=SweepAngle;
			
			// move to the inner point
			
			DX=InnerRadius*Math.sin(Angle); // offset to first point (just to the right of bottom-center
			DY=InnerRadius*Math.cos(Angle);

			X=CenterX+DX;
			Y=CenterY+DY;

			Result[0][i*2+1]=CenterX+DX;
			Result[1][i*2+1]=CenterY+DY;

			Angle+=SweepAngle;
		}
	}
	
	
	return(Result);
}

//******************************************************************
// Private GUI untilities
//******************************************************************
/**
* @private
*/
CMUtilities.PositionControl=function(SelectControl,Position,X,Y)
{
	if (Position!=undefined)
	{
		SelectControl.style.position=Position;
		SelectControl.style.left=X+"px";
		SelectControl.style.top=Y+"px";
	}
}
/**
* @private
*/
CMUtilities.CreateSelectControl=function(Values,Selected,Position,X,Y)
{
	var TheControl=document.createElement("SELECT");

	var SelectedIndex=-1;
	for (var i=0;i<Values.length;i++)
	{
		if (Selected==Values[i]) SelectedIndex=i;
	
		var option = document.createElement("option");
		option.text =Values[i];
		TheControl.add(option);
	}
	if (SelectedIndex!=-1) TheControl.selectedIndex=SelectedIndex;
	
	CMUtilities.PositionControl(TheControl,Position,X,Y);
	
	return(TheControl);
}
/**
* @private
*/
CMUtilities.CreateSliderControl=function(Min,Max,Value,Position,X,Y)
{
	var SliderControl=document.createElement("input");
	SliderControl.type="range";
	SliderControl.min=Min;
	SliderControl.max=Max;
	SliderControl.value=Value;
	
	CMUtilities.PositionControl(SliderControl,Position,X,Y);
	
	return(SliderControl);
}
/**
* @private
*/
CMUtilities.CreateCheckboxControl=function(Value,Position,X,Y)
{
	var SliderControl=document.createElement("input");
	SliderControl.type="checkbox";
	SliderControl.value=Value;
	
	CMUtilities.PositionControl(SliderControl,Position,X,Y);
	
	return(SliderControl);
}
//******************************************************************
// Public GUI untilities
//******************************************************************

/**
* Creates a DOM element at the specified location
* @param Text - the text displayed in the element
* @param Position - CSS position parameter
* @param X - pixel-based horizontal position
* @param Y - pixel-based vertical position
* @public
* @returns TheElement - DOM element (DIV)
*/
CMUtilities.CreateLabelControl=function(Text,Position,X,Y)
{
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Text;
	
	CMUtilities.PositionControl(TheLabel,Position,X,Y);
	
	return(TheLabel);
}

/*
* Dimensions are for the box, the triangle will be placed below it
* @public
* @param ID - The name of the balloon element to create (typically each map has a unique ID)
* @param Left - location to tie the tooltip to (typically the X coordinate of the mouse down) 
* @param Top - location to tie the tooltip to (typically the Y coordinate of the mouse down)
* @param Width - desired width of the tool tip (in future versions, the tooltip may be smaller
*				based on the width of the text)
* @param Height - ignored, the tooltip now sizes with it's contents
* @param Text - the HTML to place int he tooltip
* @returns TheElement - DOM element (DIV)
*/
CMUtilities.CreateInfoWindow=function(ID,MouseX,MouseY,Width,Height,Text,ImageFolder)
{
	var Padding=10; // between the balloon and it's contents
	var TriangleHeight=10; // 
	var TriangleWidth=16;
	var TriangleLeftOffset=10; // offset for triangle from edge of balloon

	// get the Balloon and create it if needed
	var TheToolTip=document.getElementById(ID);
	
	if (TheToolTip!=null)
	{
		document.body.removeChild(TheToolTip);
		TheToolTip=null;
	}
	
	if (TheToolTip==null)
	{
		TheToolTip=document.createElement("DIV"); // create the DIV element
	
		TheToolTip.id=ID; // set the ID so we can get it back
	
		document.body.appendChild(TheToolTip); // add the dialog element to the document
	}

	// find the position of the balloon (from the bottom)
	
	var ScreenHeight=window.innerHeight;
	var ScrollTop=$(window).scrollTop();
	var ScreenWidth=window.innerWidth;
	var ScrollLeft=$(window).scrollLeft();

	var Above=true;
	if (MouseY<(ScreenHeight/2)) Above=false;
	
	var ToTheRight=false;
	if (MouseX<(ScreenWidth/2)) ToTheRight=true;
	
	// for debugging
/*	Text="MouseY="+MouseY+" MouseX="+MouseX+" ScreenHeight="+ScreenHeight+" ScrollTop="+ScrollTop+" asdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdf";
*/	
	//***********************************************
	// Position the balloon
	
	TheToolTip.style.position="absolute";	
	TheToolTip.style.width=Width+"px";
	
	// compute the distance from the side of the popup window to the middle of the triangle
	var TriangleToVerticalSide=(TriangleWidth/2)+Padding+(TriangleLeftOffset);
	
	if (ToTheRight)
	{
		var TheToolTipLeft=MouseX-TriangleToVerticalSide+ScrollLeft; // jjg - not sure why the TriangleLeftOffset has to be divided by 2
		TheToolTip.style.left=TheToolTipLeft+"px";
	}
	else
	{
		var TheToolTipLeft=MouseX+TriangleToVerticalSide+ScrollLeft-Width; // jjg - not sure why the TriangleLeftOffset has to be divided by 2
		TheToolTip.style.left=TheToolTipLeft+"px";
	}
	
	if (Above) // tooltop is above the point clicked on (triangle is just above and then the body of the tool tip
	{
		var TheToolTipBottom=ScreenHeight-MouseY-ScrollTop+TriangleHeight;
		TheToolTip.style.bottom=TheToolTipBottom+"px";
	}
	else
	{
		var TheToolTipTop=MouseY+TriangleHeight+ScrollTop;
		TheToolTip.style.top=TheToolTipTop+"px";
	}
//	TheToolTip.style.border='2px solid #ff0000';
	
	//********************************************
	// create the box in the div tag
	
	var TheBox=document.createElement("div");
	TheBox.className="CM_InfoBox";
	TheBox.innerHTML=Text;
	TheBox.style.padding=Padding+'px';

	TheToolTip.appendChild(TheBox); // add the dialog element to the document
	
	//***********************************************
	// add the triangle
	
	var TheTriangle=document.createElement("div");
	TheToolTip.appendChild(TheTriangle); // add the dialog element to the document
	TheTriangle.style.position="absolute";
	
	if (ToTheRight)
	{
		TheTriangle.style.left=(TriangleToVerticalSide-(TriangleWidth/2))+'px';
	}
	else
	{
		TheTriangle.style.right=(TriangleToVerticalSide-(TriangleWidth/2))+'px';
	}
	if (Above==false)
	{
		TheTriangle.style.top=(-TriangleHeight-3)+'px'; // Changed this from top to bottom
		TheTriangle.innerHTML="<img src='"+ImageFolder+"Triangle_Up.png'></img>";
	}
	else
	{
		TheTriangle.style.bottom=(-TriangleHeight-3)+'px'; // Changed this from top to bottom
		TheTriangle.innerHTML="<img src='"+ImageFolder+"Triangle_Down.png'></img>";
	}
// Old code to create the triangle using a non-rectangular div tag
/*	TheTriangle.className="CM_InfoArrow";
	
	TheTriangle.style.width='0';
	TheTriangle.style.height='0';
	
	if (ToTheRight)
	{
		TheTriangle.style.left=TriangleLeftOffset+'px';
	}
	else
	{
		TheTriangle.style.left=(Width-TriangleLeftOffset-TriangleWidth-Padding)+'px';
	}
	if (Above==false)
	{
		TheTriangle.style.borderBottomWidth='10px';
		TheTriangle.style.borderTopWidth='0px';
		
		TheTriangle.style.top=-TriangleHeight+'px'; // Changed this from top to bottom
	}
	else
	{
		TheTriangle.style.bottom=-TriangleHeight+'px'; // Changed this from top to bottom
		
		TheTriangle.style.borderBottomWidth='0px';
		TheTriangle.style.borderTopWidth='10px';
	}
	*/
	//***********************************************
	// setup visibility

	TheToolTip.style.visibility="visible";
	
	return(TheToolTip);
}
/*
* Attempt to make an info window that uses CSS styles entry for positioning
* Works except for a 1 pixel offset in FireFox that is different from IE or Chrome!
* No longer used.
* @private
*/
CMUtilities.CreateInfoWindow2=function(ID,MouseX,MouseY,Width,Height,Text,ImageFolder)
{
//	var Padding=10; // between the balloon and it's contents
//	var TriangleHeight=10; // 
//	var TriangleWidth=16;
	var TriangleOffset=20; // offset for triangle from edge of balloon

	// get the Balloon and create it if needed
	var TheToolTip=document.getElementById(ID);
	
	if (TheToolTip!=null)
	{
		document.body.removeChild(TheToolTip);
		TheToolTip=null;
	}
	
	if (TheToolTip==null)
	{
		TheToolTip=document.createElement("DIV"); // create the DIV element
		TheToolTip.className="CM_InfoContainer";
		TheToolTip.id=ID; // set the ID so we can get it back
	
		document.body.appendChild(TheToolTip); // add the dialog element to the document
	}

	// find the position of the balloon (from the bottom)
	
	var ScreenHeight=window.innerHeight;
	var ScrollTop=$(window).scrollTop();
	var ScreenWidth=window.innerWidth;
	var ScrollLeft=$(window).scrollLeft();

	var Above=true;
	if (MouseY<(ScreenHeight/2)) Above=false;
	
	var ToTheRight=false;
	if (MouseX<(ScreenWidth/2)) ToTheRight=true;
	
	// for debugging
/*	Text="MouseY="+MouseY+" MouseX="+MouseX+" ScreenHeight="+ScreenHeight+" ScrollTop="+ScrollTop+" asdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asf asdf asdf asdf asdf asdf asdf asdf asdf";
	*/
	//***********************************************
	// Position the balloons
	
	// compute the distance from the side of the popup window to the middle of the triangle
//	var TriangleToVerticalSide=(TriangleWidth/2)+Padding+(TriangleOffset);
	var TriangleToVerticalSide=TriangleOffset;
	
	if (ToTheRight)// info window is to the right of the mouse (i.e. the mouse was clicked in the left of the screen)
	{
		var TheToolTipLeft=MouseX+ScrollLeft-TriangleToVerticalSide; // jjg - not sure why the TriangleOffset has to be divided by 2
		TheToolTip.style.left=TheToolTipLeft+"px";
	} 
	else // info window is to the left of the mouse (i.e. the mouse was clicked in the right of the screen)
	{
		// find the distance the mouse is from the right side of the document
		var MouseXFromRight=ScreenWidth-(MouseX+ScrollLeft);
		
		var TheToolTipRight=MouseXFromRight-TriangleToVerticalSide; // jjg - not sure why the TriangleOffset has to be divided by 2
		TheToolTip.style.right=TheToolTipRight+"px";
	}
	
	if (Above) // tooltop is above the point clicked on (triangle is just above and then the body of the tool tip (i.e. the point was in the bottom half)
	{
		var TheToolTipBottom=ScreenHeight-MouseY-ScrollTop;
		TheToolTip.style.bottom=TheToolTipBottom+"px";
	}
	else // tool tip is below the point clicked on (i.e. the poitn was in the top half of the map)
	{
		var TheToolTipTop=MouseY+ScrollTop;
		TheToolTip.style.top=TheToolTipTop+"px";
	}
//	TheToolTip.style.border='2px solid #ff0000';
	
	//********************************************
	// create the box in the div tag
	
	var TheBox=document.createElement("div");
	TheBox.innerHTML=Text;

	TheToolTip.appendChild(TheBox); // add the dialog element to the document
	
	//***********************************************
	// add the triangle
	
	var TheTriangle=document.createElement("div");
//	TheTriangle.style.position="absolute";
	
	if (Above) // info window is above the point clicked on (i.e. the triangle is below the box)
	{
		TheBox.className="CM_InfoBoxAboveTriangle";
		
		TheTriangle.innerHTML="<img src='../../../CanvasMap/Includes/"+ImageFolder+"Triangle_Down.png'></img>";
		if (ToTheRight) // lower left
		{
			TheTriangle.className="CM_InfoArrowSW";
		}
		else // lower right
		{
			TheTriangle.className="CM_InfoArrowSE";
		}
	}
	else // info window is below the point clicked on (i.e. the triangle is above the box)
	{
		TheBox.className="CM_InfoBoxBelowTriangle";
		
		TheTriangle.innerHTML="<img src='../../../CanvasMap/Includes/"+ImageFolder+"Triangle_Up.png'></img>";
		
		if (ToTheRight) // top left
		{
			TheTriangle.className="CM_InfoArrowNW";
		}
		else // top right
		{
			TheTriangle.className="CM_InfoArrowNE";
		}
	}
	TheToolTip.appendChild(TheTriangle); // add the dialog element to the document

	//***********************************************
	// setup visibility

	TheToolTip.style.visibility="visible";
	
	return(TheToolTip);
}
//******************************************************************
// Region untilities
//******************************************************************

/**
* Determines if the specified point is within the tolerance of one of the TheCoordinates
* @public
* @param RefX - horizontal coordinate value
* @param RefY - vertical coordinate value
* @param TheCoordinates - array of coordinate values where [i][0]=x, [i][1]=y (i.e. the OGS standard)
* @param Tolerance - horizontal coordinate value
* @returns Flag - true if the line segements defined by TheCoordinates are within Tolerance of the 
*					point defined by RefX,RefY
*/
CMUtilities.InPolyline=function(RefX,RefY,Xs,Ys,Tolerance)
{
	var Result=false;
	
	if (Xs!=undefined)
	{
		var X1=Xs[0];
		var Y1=Ys[0];
		for (var j=1; (j < Xs.length)&&(Result==false); j++) 
		{
			var X2=Xs[j];
			var Y2=Ys[j];
			
			var Distance=CMUtilities.DistanceToSegment(X1,Y1,X2,Y2,RefX,RefY);

			if (Distance<=Tolerance) 
			{
				Result=true;
			}
			
			X1=X2;
			Y1=Y2;
		}
	}
	return(Result);
}

//******************************************************************
// Private Coordinate Formatting Utiliies
//******************************************************************
/*
* returns the appropriate symbol (N or S) for a coordinate value
* @private
*/
CMUtilities.GetSymbol=function(Value,EastWestFlag)
{
	var Symbol="N";
	if (EastWestFlag) Symbol="E";
	if (Value<0)
	{
		Symbol="S";
		if (EastWestFlag) Symbol="W";
	}
	return(Symbol);
}

/*
* Return an text string with latitude and longitude formatted as "40 30' 40" N 124 12' 32" S" (with the degree symbols)
* @private
*/

CMUtilities.GetDMSFromLonLat=function(Longitude,Latitude,NotHTML)
{
	var LongitudeText=CMUtilities.GetDMSFromDD(Longitude,true,NotHTML);
	var LatitudeText=CMUtilities.GetDMSFromDD(Latitude,false,NotHTML);
	
	var Text=LatitudeText+ " " +LongitudeText;
	
	return(Text);
}

/*
* Return an javascript object with latitude and longitude formatted as "40 30' 40" N 124 12' 32" S" (with the degree symbols)
* @private
*/
CMUtilities.GetDMSFromLonLatJSObject=function(Longitude,Latitude)
{
	var LongitudeText=CMUtilities.GetDMSFromDD(Longitude,true);
	var LatitudeText=CMUtilities.GetDMSFromDD(Latitude,false);
	
	var Result={
		Latitude: LatitudeText,
		Longitude: LongitudeText
	}
	
	return(Result);
}

/*
* Return a string formatted from an Easting and a Northing
* @private
*/
CMUtilities.GetTextFromEastingNorthing=function(Easting,Northing)
{
	var EastingSymbol=CMUtilities.GetSymbol(Easting,true);
	var NorthingSymbol=CMUtilities.GetSymbol(Northing,false);
	
	if (Easting<0) Easting=-Easting;
	if (Northing<0) Northing=-Northing;
	
	Easting=Math.floor(Easting);
	Northing=Math.floor(Northing);
	
	var Text=Easting+" "+EastingSymbol+" "+Northing+" "+NorthingSymbol;

	return(Text);
}
//******************************************************************
// Coordinate Formatting Utiliies
//******************************************************************
/*
* Returns Degree, Minute, Second string from a Decimal Degree string.
* @public
* @param Value - the DD value
* @param EastWestFlag - true if the DMS value is east/west, false for north/south
* @param NotHTML - true if the value will be displayed as HTML
* @param VariablePrecision - true to padd the DMS with zeros.
* @returns - the DMS string
*/

CMUtilities.GetDMSFromDD=function(Value,EastWestFlag,NotHTML,VariablePrecision)
{
	var Symbol=CMUtilities.GetSymbol(Value,EastWestFlag);
	
	if (Value<0) Value=-Value;
	
	var Degrees=Math.floor(Value);
	
	var DegreeSymbol="\xB0";
	if (NotHTML===true) DegreeSymbol="\xB0";
	
	var Text=Degrees+DegreeSymbol;
	
	Value=(Value-Degrees)*60;
	
	var Minutes=Math.floor(Value);
	
	if ((VariablePrecision===false)||(Minutes!=0))
	{
		Text+=Minutes+"' ";
		
		Value=(Value-Minutes)*60;
		
		var Seconds=Math.floor(Value);
		
		if ((VariablePrecision===false)||(Seconds!=0))
		{
			Text+=Seconds+"\"";
		}
	}
	Text+=" "+Symbol;
	
	return(Text);
}

//******************************************************************
// Bounding box functions
//******************************************************************
/**
* Determines if the second bounds is included within the first bounds.
* @public
* @param ExteriorBounds
* @param InteriorBounds
* @returns Flag - true if the interior bounds is inside the exterior bounds (they can touch and this can still be true)
*/
CMUtilities.BoundsIncludes=function(ExteriorBounds,InteriorBounds)
{
	var Result=false;
	
	if ((CMUtilities.IsDefined(ExteriorBounds))&&(CMUtilities.IsDefined(InteriorBounds)))
	{
		if ((InteriorBounds.XMax<=ExteriorBounds.XMax)&&
			(InteriorBounds.XMin>=ExteriorBounds.XMin)&&
			(InteriorBounds.YMax<=ExteriorBounds.YMax)&&
			(InteriorBounds.YMin>=ExteriorBounds.YMin)) // inside primary dimensions
		{
			if ((InteriorBounds.ZMin!=undefined)&&(ExteriorBounds.ZMin!=undefined))
			{
				if ((InteriorBounds.ZMin<=ExteriorBounds.ZMax)&&
					(InteriorBounds.ZMax>=ExteriorBounds.ZMin)) // inside primary dimensions
				{
					Result=true;
				}
			}
			else
			{
				Result=true;
			}
		}
	}
	return(Result);
}
/**
* Returns true if the two bounds objects overlap
* @public
* @param Bounds1
* @param Bounds2
* @returns Flag - true if the bounds overlap, false otherwise
*/
CMUtilities.BoundsOverlap=function(Bounds1,Bounds2)
{
	var Result=false;
	
	if ((CMUtilities.IsDefined(Bounds1))&&(CMUtilities.IsDefined(Bounds2)))
	{
		if ((Bounds1.XMin<=Bounds2.XMax)&&
			(Bounds1.XMax>=Bounds2.XMin)&&
			(Bounds1.YMin<=Bounds2.YMax)&&
			(Bounds1.YMax>=Bounds2.YMin)) // inside primary dimensions
		{
			if ((Bounds1.ZMin!=undefined)&&(Bounds2.ZMin!=undefined))
			{
				if ((Bounds1.ZMin<=Bounds2.ZMax)&&
					(Bounds1.ZMax>=Bounds2.ZMin)) // inside primary dimensions
				{
					Result=true;
				}
			}
			else
			{
				Result=true;
			}
		}
	}
	return(Result);
}
/**
* Returns a clone of the specified bounds object.
* @public
* @param TheBounds
* @returns ClonedBounds
*/
CMUtilities.CloneBounds=function(TheBounds)
{
	var clonedObject=
	{
  		XMin: TheBounds.XMin,
 		XMax: TheBounds.XMax,
 		YMin: TheBounds.YMin,
 		YMax: TheBounds.YMax
 	}
	if (TheBounds.ZMin!=undefined)
	{
		clonedObject.ZMin=TheBounds.ZMin;
		clonedObject.ZMax=TheBounds.ZMax;
	}
	return(clonedObject);
}
/**
* Makes sure that the area of the specified bounds is within the returned bounds.
* @public
* @param TheBounds
* @param NewBounds
* @returns TheBounds - Bounds with the NewBounds included
*/
CMUtilities.AddToBounds=function(TheBounds,NewBounds)
{
	if (TheBounds==null) 
	{
		TheBounds=NewBounds;
	}
	else if (NewBounds!=null)
	{
		if (NewBounds.XMin<TheBounds.XMin) TheBounds.XMin=NewBounds.XMin;
		if (NewBounds.XMax>TheBounds.XMax) TheBounds.XMax=NewBounds.XMax;
		if (NewBounds.YMin<TheBounds.YMin) TheBounds.YMin=NewBounds.YMin;
		if (NewBounds.YMax>TheBounds.YMax) TheBounds.YMax=NewBounds.YMax;
		
		if (NewBounds.ZMin!=undefined)
		{
			if (TheBounds.ZMin==undefined)
			{
				TheBounds.ZMin=NewBounds.ZMin;
				TheBounds.ZMax=NewBounds.ZMax;
			}
			else
			{
				if (NewBounds.ZMin<TheBounds.ZMin) TheBounds.ZMin=NewBounds.ZMin;
				if (NewBounds.ZMax>TheBounds.ZMax) TheBounds.ZMax=NewBounds.ZMax;
			}
		}
	}
	return(TheBounds);
}
/**
* Expands the bounds by the specified amount
* @public
* @param TheBounds
* @param Amount - amount to expand the bounds in each direction
*/
CMUtilities.ExpandBounds=function(TheBounds,Amount)
{
	TheBounds.XMin-=Amount;
	TheBounds.XMax+=Amount;
	TheBounds.YMin-=Amount;
	TheBounds.YMax+=Amount;
}

//******************************************************************
// Geometry calculations
//******************************************************************
/**
 * Computes the distance from a line segment to a point.
 * @private
 * @param SX1 - X value of first line segement coordinate
 * @param SY1 - Y value of first line segement coordinate
 * @param SX2 - X value of second line segement coordinate
 * @param SY2 - Y value of second line segement coordinate
 * @param PX1 - X value of point
 * @param PY1 - Y value of point
 * @returns MinDistance - the minimum distance from the point to the segment
 */
CMUtilities.DistanceToSegment=function( SX1, SY1, SX2, SY2, PX1, PY1)
{
	var		Result=0;

	//**********************************************
	// new code
	
	// find the equation of a line through the line segment
	
	var Slope=(SY2-SY1)/(SX2-SX1);
	
	var Intercept=SY2-(Slope*SX2);
	
	// convert to ax+by+c=0 form
	var a=Slope;
	var b=-1;
	var c=Intercept;
	
	// find the closest point on the line to the target point
	
	var factor1=(a*a+b*b);
	
	var x=(b*(b*PX1-a*PY1)-(a*c))/factor1;
	
	var y=(a*(-b*PX1+a*PY1)-b*c)/factor1;
	
	// make sure that the first point is above the second for the tests below
	
	if (SY1>SY2) // swap the points so 1 is on bottom (SY1<SY2)
	{
		var Temp=SY1;
		SY1=SY2;
		SY2=Temp;
		
		Temp=SX1;
		SX1=SX2;
		SX2=Temp;
	}
	
	var Distance=null;
	if (y<SY1) // point on the line is below SY1
	{
		Distance=Math.sqrt((PX1-SX1)*(PX1-SX1)+(PY1-SY1)*(PY1-SY1));
	}
	else if (y>SY2) // point on line is above SY2
	{
		Distance=Math.sqrt((PX1-SX2)*(PX1-SX2)+(PY1-SY2)*(PY1-SY2));
	}
	else if ((y==SY1)&&(y==SY2)) // all are colinear
	{
		if (SX1<SX2) // Point 1 is on the left, point2 is on the right
		{
			if (x<SX1) // point is to the left of point 1
			{
				Distance=Math.sqrt((PX1-SX1)*(PX1-SX1)+(PY1-SY1)*(PY1-SY1));
			}
			else if (x>SX2) // point is to the right of point 2
			{
				Distance=Math.sqrt((PX1-SX2)*(PX1-SX2)+(PY1-SY2)*(PY1-SY2));
			}
		}
		else // Point 2 is on the left, Point 1 on the right
		{
			if (x<SX2) // point is to the left of point 2
			{
				Distance=Math.sqrt((PX1-SX2)*(PX1-SX2)+(PY1-SY2)*(PY1-SY2));
			}
			else if (x>SX1) // oint is to the right of point 1
			{
				Distance=Math.sqrt((PX1-SX1)*(PX1-SX1)+(PY1-SY1)*(PY1-SY1));
			}
		}
	}
	
	if (Distance===null) // if we still don't have a distance, use the distance to the point on the line segement 
	{
		Distance=Math.sqrt((x-PX1)*(x-PX1)+(y-PY1)*(y-PY1));
	}
	Result=Distance;
	//**********************************************
	// old code
	
//		Vector c = Point - a;	// Vector from a to Point

	// find the vector from the first line segement point to the target point
	
/*	var CX=PX1-SX1;
	var CY=PY1-SY1;

//		float d = (b - a).Length();	
	
	// find the length of the line segment
	
	var LengthOfLineSegment=Math.sqrt((SX1-SX2)*(SX1-SX2)+(SY1-SY2)*(SY1-SY2));
	
//		Vector v = (b - a).Normalize();	// Unit Vector from a to b

	// find the unit vector to go from the first line segement point to the second line segment point
	
	var VX=(SX2-SX1)/LengthOfLineSegment;
	var VY=(SY2-SY1)/LengthOfLineSegment;

//		float t = v.DotProduct(c);	// Intersection point Distance from a

	// find the dot product between the line segment vector and the vector from the line segement to the target point
	
	var T=VX*CX+VY*CY;

	// Check to see if the point is on the line
	// if not then return the endpoint
	
	// if T is negative then the intersection is before the first line segment
	// if T is greater than the length of the line segment then the intersection is after the second line segment point
	// otherwise, the intersection is between the two line segment points (i.e. on the line segment)
	
	if (T < 0) Result=DistanceTo1; // intersection is before the line segement point 1
	else if (T > LengthOfLineSegment) Result=DistanceTo2; // insertsection is after the line segement point 2
	else // insertsection is in the line segement
	{
		// find the point of intersection
		
		var IX=SX1+VX*T;
		var IY=SY1+VY*T;

		// find the dsitance from the intersection point to the target point
		 
		Result=Math.sqrt((IX-PX1)*(IX-PX1)+(IY-PY1)*(IY-PY1));
	}
*/
	return(Result);
}

//******************************************************************
// Private Functions to Determine if a coordinate is inside a feature and
// which feature it is in.
//******************************************************************
/**
 * Return an array with the coeficients for a line through two points
 * @private
 * @param X1 horizontal value for the first point
 * @param Y1
 * @param X2
 * @param Y2
 * @returns [m,b] - an array with [0]=m, [1]=b
 */
CMUtilities.GetLineFactors=function( X1, Y1, X2, Y2)
{
	var			b;
	var			m;
	var Result=[2];
	
	if (Y1==Y2) // the line is horizontal at Y1
	{
		b=Y1; // y intercept of the x origin line

		m=0; // slope relative to y (normally x)
	}
	else if (X1==X2) // the line is vertical at X1
	{
		m=Number.POSITIVE_INFINITY;
		b=Number.NaN;
	}
	else
	{
		m=(Y2-Y1)/(X2-X1); // slope relative to y (normally x)
		
//			b1=(X1*Y2-X2*Y1)/(X1-X2); // x intercept of the y origin line

		b=Y1-(X1*m);
	}
	Result[0]=m;
	Result[1]=b;
	
	return(Result);
}
/**
 * Utility function for Inside()
 * @private
 * @param StartX
 * @param StartY
 * @param EndX
 * @param EndY
 * @param RefX
 * @param RefY
 * @returns
 */
CMUtilities.FindNumLineCrossingsToTheRight=function( StartX, StartY, EndX, EndY, RefX, RefY)
{
	var NumCrossings=0;
	
	if (StartY!=EndY) // ignore flat lines
	{
		if ((StartX>RefX)||(EndX>RefX)) // the line could be to the right of the point
		{
			if (((StartY<RefY)&&(EndY>RefY))||
				(StartY>RefY)&&(EndY<RefY)) // point y coordinate values is bounded by Y coordinates values
			{
				if (StartX==EndX) // have to special case a vertical line (m=inifinity and b=NaN)
				{
					if (RefX<StartX) // vertical line is to the right of the point
					{
						NumCrossings++; 
					}
				}
				else
				{
					Factors=CMUtilities.GetLineFactors(StartX,StartY,EndX,EndY);

					var m=Factors[0];
					var b=Factors[1];
					var x=(RefY-b)/m;

					if (RefX<x) // horizontal line through the point crosses the line to the right of the point
					{
						NumCrossings++;
					}
				}
			}
		}
	}
	return(NumCrossings);
}
//******************************************************************
// Pblic Functions to Determine if a coordinate is inside a feature and
// which feature it is in.
//******************************************************************
/**
 * Determines if the specified point is within the specified polygon.
 * This is done by counting the number of line segements from the polygon
 * that a horiziontal line through the point would intersect with.
 * If the number of lines is odd, then the point is inside the polygon.
 * If the number of lines is even, then the point is outside.
 * 
 * Most similar algorithms do not deal with flat lines very well.  The problem
 * is that there can be a flat line to the right of the point.  This approach:
 * - Does not check the start and end points in the FindNumLineCrossingsToTheRight()
 * function.  These are special cased.
 * - Flat areas are "ignored" 
 * - When the point of interest is at the same Y value as a point in the polygon:
 *	- When the direction of a flat area changes, there is not crossing (peak or valley with a flat top or bottom)
 *  - For non flat areas the approach is the same, if the direction changes, we're on a peak or vally and the number of crossings does not change.
 * 
 * @public
 * @param RefX - x coordinate value to test
 * @param RefY - y coordinate value to test
 * @param Xs - array of x coordinate values, does not need to close
 * @param Ys - array of y coordinate values, does not need to close
 * @param NumPoints - number of coordinates to test in the array.
 * @returns Flag
 */
CMUtilities.InsideAPolygon=function(RefX,RefY,Xs,Ys,NumPoints)
{
	var Result=false;
	var NumCrossings=0;
	var LastYDirection=0;
	var NewYDirection=0;
	
	// find the previous direction
	
	for (var i=0;i<NumPoints-1;i++)
	{
		if (Ys[i+1]>Ys[i]) LastYDirection=1;
		else if (Ys[i+1]<Ys[i]) LastYDirection=-1;
	}
	
	// if we are already on a flat area (from previous segment), do not count it as it will be counted when it comes around
	
	var OnFlat=false;
	if ((Ys[NumPoints-1]==Ys[0])&&(RefY==Ys[0])&&(RefX<Xs[0])&&(RefX<Xs[NumPoints-1])) 
	{
		OnFlat=true;
	}
	
	// check each point
	
	for (var i=0;i<NumPoints;i++)
	{
		// find the next to the next point (it's the first point for the last segement)
		
		var NextIndex=i+1;
		if (NextIndex==NumPoints) NextIndex=0;
		
		// determine if we are even with a flat segment
		
		if (Ys[i]==Ys[NextIndex]) // special case flat lines
		{
			if (RefY==Ys[i]) // we are on a flat line that is coincident with the point
			{
				if ((RefX<Xs[i])&&(RefX<Xs[NextIndex])) 
				{
					// record that we have a flat line to the right (counts as intercept if direction stays the sme)
					
					OnFlat=true;
				}
			}
		}
		else // we are on a sloped line
		{
			// determine the new direction we are moving in (up or down)

			if (Ys[NextIndex]>Ys[i]) NewYDirection=1;
			else if (Ys[NextIndex]<Ys[i]) NewYDirection=-1;

			// update the number of crossings
			
			if (OnFlat) // we were on a flat segement with the same Y value as RefY
			{
				if (NewYDirection==LastYDirection) // the direction has stayed the same
				{
					NumCrossings++; // add a crossing
				}
			}
			else // were not on a flat section
			{
				if (Ys[i]==RefY) // check the start point
				{
					if (RefX<Xs[i]) // were to the left of the start point
					{
						if (NewYDirection==LastYDirection) // direction has stayed the same (i.e. we are not next to a peak or valley)
						{
							NumCrossings++;
						}
					}
				}
				else
				{
					NumCrossings+=CMUtilities.FindNumLineCrossingsToTheRight(Xs[i],Ys[i],Xs[NextIndex],Ys[NextIndex],RefX,RefY);
				}
			}			
			
			// update variables
			
			OnFlat=false; // we're no longer on a flat section
			
			LastYDirection=NewYDirection; // save the current direction for next time
		}
	}
	
	// if the number of crossings is odd, we are inside the polygon
	
	if ((NumCrossings%2)==1) 
	{
		Result=true;
	}
	return(Result);
}
/**
* Return the rectangular bounds for the specified polygon
* @public 
* @param Xs
* @param Ys
* @param NumPoints
* @returns Bounds - Bounds surrounding the polygon
*/
CMUtilities.GetPolygonBounds=function(Xs,Ys,NumPoints)
{
	var Result=null;
	
	if (NumPoints>0)
	{
		var XMin=Xs[0];
		var XMax=Xs[0];
		var YMin=Ys[0];
		var YMax=Ys[0];
			
		for (var i=1;i<NumPoints;i++)
		{
			if (Xs[i]<XMin) XMin=Xs[i];
			if (Xs[i]>XMax) XMax=Xs[i];
			if (Ys[i]<YMin) YMin=Ys[i];
			if (Ys[i]>YMax) YMax=Ys[i];
		}
		Result={
			XMin:XMin,
			XMax:XMax,
			YMin:YMin,
			YMax:YMax
		}
	}
	return(Result);
}
/*
* Finds the distance between two points
* @public
* @param X1,Y1,X2,Y2 - two coordinates
* @returns Distance - numeric distance between the two points
*/
CMUtilities.GetLength=function(X1,Y1,X2,Y2)
{
	return(Math.sqrt((X2-X1)*(X2-X1)+(Y2-Y1)*(Y2-Y1)));
}
/*
* Finds the intersection between two line segements
* from: http://www-cs.ccny.cuny.edu/~wolberg/capstone/intersection/Intersection%20point%20of%20two%20lines.html
* @public
* @param X1,Y1,X2,Y2 - two coordinates
* @returns Result - [0]=RefX, [1]=RefY
*/
CMUtilities.IntersectionOfTwoLineSegments=function(x1,y1,x2,y2,x3,y3,x4,y4)
{
	var d=(y4-y3)*(x2-x1)-(x4-x3)*(y2-y1);
	
	var ua=(x4-x3)*(y1-y3)-(y4-y3)*(x1-x3);
	
	var ub=(x2-x1)*(y1-y3)-(y2-y1)*(x1-x3);
	
	ua=ua/d;
	ub=ub/d;
	
	var RefX=x1+ua*(x2-x1);
	var RefY=y1+ua*(y2-y1);
	
	return([RefX,RefY]);
}

//*************************************************************************
// Time and date utilities
//*************************************************************************
/**
* Return the current number of seconds for timing code
* @public
* @returns Seconds - number of seconds
*/
CMUtilities.GetSeconds=function()
{
	var d = new Date();
	var n = d.getTime();
	return(n/1000);
}
//*************************************************************************
// General Utilities
//*************************************************************************
/**
* Create a clone of the specified object.
* Adapted from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
* @public
* @returns ClonedObject
*/
CMUtilities.Clone=function(TheObject) 
{
	var Result=TheObject;
	
	if ((TheObject != null) && (typeof(TheObject) === 'object') && (('isActiveClone' in TheObject)==false))
	{
		if (TheObject instanceof Date)
		{
			Result = new TheObject.constructor(); //or new Date(obj);
		}
		else
		{
			Result = TheObject.constructor();
		}
		
		for (var key in TheObject) 
		{
			if (Object.prototype.hasOwnProperty.call(TheObject, key)) 
			{
				TheObject['isActiveClone'] = null;
				Result[key] = CMUtilities.Clone(TheObject[key]);
				delete TheObject['isActiveClone'];
			}
		}
	}
	return(Result);
}
/**
* Gets a text string with the specified units for display.  
* @public
* @param - RefX - East/West coordinate value
* @param - RefY - North/South coordinate value
* @param - CoordinateUnits - The desired coordinate units from CMUtilities.COORDINATE_UNITS
* @param - TheProjector - Optional projector if the coodinates need to be converted.
* @param - TheView - Optional parameter if the zoom level or pixel location is desired.
* @returns CoordinateString
*/
CMUtilities.GetCoordinateString=function(RefX,RefY,CoordinateUnits,TheProjector,TheView)
{
	var Text="";

	switch (CoordinateUnits)
	{
	case CMUtilities.COORDINATE_UNITS_DD:
		{
			if (TheProjector!=null) //
			{
				var GeographicCoordinate=TheProjector.ProjectToGeographic(RefX,RefY);
				
				if (GeographicCoordinate!=null)
				{
					RefX=GeographicCoordinate[0];
					RefY=GeographicCoordinate[1];
				}
				else
				{
					Text="Undefined";
				}
			}
			
			if (Text=="")
			{
				// limit the number of decimal points
				
				RefX=Math.floor(RefX*10000)/10000;
				RefY=Math.floor(RefY*10000)/10000;
								
				var LongitudeSymbol=CMUtilities.GetSymbol(RefX,true);
				var LatitudeSymbol=CMUtilities.GetSymbol(RefY,false);
				
				if (RefX<0) RefX=-RefX;
				if (RefY<0) RefY=-RefY;
				
				Text+=""+RefY+"\xB0 "+LatitudeSymbol+" "+RefX+"\xB0 "+LongitudeSymbol; // HTML
			}
		}
		break;
	case CMUtilities.COORDINATE_UNITS_DMS:
		{
			if (TheProjector!=null) //Text="Sorry, we need a projector to show geographic coordinates with projected data";
			{
				var GeographicCoordinate=TheProjector.ProjectToGeographic(RefX,RefY);
				
				if (GeographicCoordinate!=null)
				{
					RefX=GeographicCoordinate[0];
					RefY=GeographicCoordinate[1];
					
					Text+=CMUtilities.GetDMSFromLonLat(RefX,RefY,true);
				}
				else
				{
					Text="Undefined";
				}
			}
		}
		break;
	case CMUtilities.COORDINATE_UNITS_FEET:
	case CMUtilities.COORDINATE_UNITS_METERS:
		{
			Text+=CMUtilities.GetTextFromEastingNorthing(RefX,RefY);
		}
		break;
	case CMUtilities.COORDINATE_UNITS_PIXELS: // for debugging
		{
			PixelX=TheView.GetPixelXFromRefX(RefX);
			PixelY=TheView.GetPixelYFromRefY(RefY);
			Text+=""+PixelX+", "+PixelY;
		}
		break;
	case CMUtilities.COORDINATE_UNITS_ZOOM:
		{
			Text+=TheView.GetZoomLevel();
		}
		break;
	}
	return(Text);
}
/**
* Helper function to create and append an element to a parent element.
* @protected
* @returns TheChildElement
*/
CMUtilities.AppendElement=function(ElementType,TheParent)
{
	var TheChild = document.createElement(ElementType);
	TheParent.appendChild(TheChild);	
	return(TheChild);			
}
/*
* Extract the font size from a fton string that may contain "px"
* @protected
* @param Font - the font string
* @returns FontSize -  the size of the font in pixels
*/
CMUtilities.GetFontSizeFromFont=function(Font)
{
	var FontSize=12;
	
	var Index=Font.indexOf("px");
	if (Index!=-1)
	{
		var Temp=Font.substring(0,Index);
		
		Index=Temp.lastIndexOf(" ");
		
		if (Index!=-1) { Temp=Temp.substring(Index+1); }
		
		FontSize=parseFloat(Temp);
	}
	return(FontSize);			
}
//*************************************************************************
// Area Coordinate Utilities
//*************************************************************************
/**
* Clips an area to a bounding box
* @protected
* @returns ClippedArea
*/
CMUtilities.ClipArea=function(TheArea,BBox,TheType)
{
	var NewArea=[];
	
	// get a GeoJSON version of the area
	var GeoJSONArea=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea(TheArea,TheType);
	
	try
	{
		var TempGeoJSON;
		
		// convert the area to an OGC set of coordinates
		if (TheType==CMDatasetVector.TYPE_POLYGONS) TempGeoJSON=turf.polygon(GeoJSONArea);
		else TempGeoJSON=turf.multiLineString(GeoJSONArea);
		
		// use turf to do the clip
		TempGeoJSON=turf.bboxClip(TempGeoJSON,BBox);
		
		// get the GeoJSON area coordinates
		var TheGeometry=TempGeoJSON.geometry;
	
		var NewGeoJSONArea=TheGeometry.coordinates;
	
		// if the clip produced a line string convert it to an area
		if (TheGeometry.type=="LineString") // line string is just an array of coordinates
		{
			NewGeoJSONArea=[NewGeoJSONArea];
		}
		NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(NewGeoJSONArea);
	}
	catch(err) 
	{
		var j=12;
		throw(err); // ignore errors and just return an empty NewArea array
	}
	return(NewArea);
}
/**
* Buffers an area
* @protected
* @returns BufferedArea
*/
CMUtilities.BufferArea=function(TheArea,Type,Distance)
{
	var NewArea=[];
	
	// get a GeoJSON version of the area
	try
	{
		var TempGeoJSON;
		
		switch (Type)
		{
		case CMDatasetVector.TYPE_POINTS:
			TempGeoJSON=turf.point(TheArea[0][0][0],TheArea[0][1][0]);
			break;
		case CMDatasetVector.TYPE_POLYLINES:
			var GeoJSONAreaCoordinates=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea(TheArea,Type);
	
			TempGeoJSON=turf.multiLineString(GeoJSONAreaCoordinates);
			break;
		case CMDatasetVector.TYPE_POLYGONS:
			var GeoJSONAreaCoordinates=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea(TheArea,Type);
	
			TempGeoJSON=turf.polygon(GeoJSONAreaCoordinates);
			break;
		}
		
		// use turf to do the clip
		TempGeoJSON=turf.buffer(TempGeoJSON,Distance);
		
		// get the GeoJSON area coordinates
		var TheGeometry=TempGeoJSON.geometry;
	
		var NewGeoJSONArea=TheGeometry.coordinates;
	
		// if the clip produced a line string convert it to an area
		NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(NewGeoJSONArea);
	}
	catch(err) 
	{
		var j=12;
		throw(err); // ignore errors and just return an empty NewArea array
	}
	return(NewArea);
}
/**
* Make sure each line segment does not have points with more than the specified maxDistance
* between them by adding points as needed
* @protected
* @returns NewArea
*/
CMUtilities.AddPointsToArea=function(TheArea,TheType,MaxDistance)
{
	var NewArea=[];
	for (var i=0;i<TheArea.length;i++)
	{
		var Xs=TheArea[i][0];
		var Ys=TheArea[i][1];
		
		// start the x and y arrays with the first coordinate
		var X2s=[Xs[0]];
		var Y2s=[Ys[0]];
		
		var X1,Y1,X2,Y2;
		
		var LastIndex=Xs.length-1;
		if (TheType==CMDatasetVector.TYPE_POLYGONS) LastIndex++;
		
		// add the remaining coordinates and add additional coordinates as needed
		for (var j=1;j<=LastIndex;j++)
		{
			// get the current and last coordinate
			X1=Xs[j-1];
			Y1=Ys[j-1];
			
			if (j==Xs.length) // wrap around to the first coordinate on the last segement
			{
				X2=Xs[0];
				Y2=Ys[0];
			}
			else
			{
				X2=Xs[j];
				Y2=Ys[j];
			}
			// find the change in x and y values
			var DX=X2-X1;
			var DY=Y2-Y1;
			
			// find the distance between the current and last point
			var Distance=Math.sqrt(DX*DX+DY*DY);
			
			// compute the distance that should be added to the additional point's coordinate values
			var XFactor=DX/Distance;
			var YFactor=DY/Distance;
			
			// add coordinates until the distance between the current coordinate and the last
			// coordinate is less than or equal to the MaxDistance
			var LastX=X1;
			var LastY=Y1;
			while (Distance>MaxDistance)
			{
				// get the next coordinate
				var X3=LastX+(XFactor*MaxDistance);
				var Y3=LastY+(YFactor*MaxDistance);
				
				// add the next coordinate to the new arrays
				X2s.push(X3);
				Y2s.push(Y3);
				
				// the next coordinate becomes the new last coordinate
				LastX=X3;
				LastY=Y3;
				
				// remove the distance between the next coordinate and the last coordinate
				Distance-=MaxDistance;
			}
			// add the next coordinate from the original coordinates
			X2s.push(X2);
			Y2s.push(Y2);
		}
		// add the x and y arrays to our area
		NewArea.push([X2s,Y2s]);
	}
	return(NewArea);
}
/*
* Truncate a value
* @protected
* @returns TruncatedValue
*/
CMUtilities.Truncate=function(Value)
{
	if (Value<0) Value=Math.ceil(Value);
	else Value=Math.floor(Value);
	return(Value);
}
/**
* Returns the area of the quad described by the four points in 3 dimensional space.
* Since the points are not necessiarly co-planar, the calculation uses two triangles.
* @public
* @param Xs - x coordinate values ordered as UL, UR, LR, LL
* @param Ys - y coordinate values ordered as UL, UR, LR, LL
* @returns QuadArea
*/
CMUtilities.GetQuadArea=function(Xs,Ys)
{
	Area=0;
	
	DistanceULToUR=Math.sqrt((Math.pow(Xs[0]-Xs[1],2))+(Math.pow(Ys[0]-Ys[1],2))); // UL to UR (0,1)
	
	DistanceULToLL=Math.sqrt((Math.pow(Xs[0]-Xs[3],2))+ (Math.pow(Ys[0]-Ys[3],2))); // UL to LL (0,3)
	
	DistanceLRToLL=Math.sqrt((Math.pow(Xs[2]-Xs[3],2))+(Math.pow(Ys[2]-Ys[3],2))); // LR to LL
	
	DistanceLRToUR=Math.sqrt((Math.pow(Xs[2]-Xs[1],2))+ (Math.pow(Ys[2]-Ys[1],2)));
	
	DistanceLLToUR=Math.sqrt((Math.pow(Xs[3]-Xs[1],2))+(Math.pow(Ys[3]-Ys[1],2))); // LL to UR (3, 1)
	
	// upper right, upper left, lower left (these match the 3d rendering for triangulated quads)
	
	a=DistanceULToUR;
	b=DistanceULToLL;
	c=DistanceLLToUR;
	
	s=0.5*(a+b+c);
	
	var Temp=s*(s-a)*(s-b)*(s-c);
	
	var AreaUL=Math.sqrt(Temp);
	
//	var Temp=4*Math.pow(a,2)*Math.pow(b,2)-Math.pow(Math.pow(a,2)+Math.pow(b,2)-Math.pow(c,2),2);
	
	if (Math.abs(AreaUL)<0.0000000000000001) AreaUL=0;
	if (AreaUL<0)
	{
		throw new Exception("whoops");
	}
//	var AreaUL=0.25*Math.sqrt(Temp);
	
	// bottom left, bottom right, top right 
	
	a=DistanceLRToUR;
	b=DistanceLRToLL;
	c=DistanceLLToUR;
	
	s=0.5*(a+b+c);
	
	var Temp=s*(s-a)*(s-b)*(s-c);
	
	var AreaLR=Math.sqrt(Temp);
	
	//Temp=4*Math.pow(a,2)*Math.pow(b,2)-Math.pow(Math.pow(a,2)+Math.pow(b,2)-Math.pow(c,2),2);
	
	if (Math.abs(AreaLR)<0.0000000000000001) AreaLR=0;
	if (AreaLR<0)
	{
		throw new Exception("whoops");
	}
	
	// compute the total area from thet two triangles
	
	Area=AreaUL+AreaLR;
	
	return(Area);
}
/**
* Computes the angle between two line segments in 2D space
* @public
* @param X1,Y1,X2,Y2,X3,Y3
* @returns Angle - in degrees
*/
CMUtilities.GetAngleBetweenLineSegments=function(X1,Y1,X2,Y2,X3,Y3)
{
	// normalize the segments to vectors
	var X1=X1-X2;
	var Y1=Y1-Y2;
	var X3=X3-X2;
	var Y3=Y3-Y2;
	
	var Result=CMUtilities.GetAngleBetweenVectors(X1,Y1,X3,Y3);
	
	return(Result);
}
	
/**
* Computes the angle between two vectors in 2D space
* @public
* @param X1,Y1,X2,Y2
* @returns Angle - in degrees
*/
CMUtilities.GetAngleBetweenVectors=function(X1,Y1,X2,Y2)
{
	var DotProduct=(X1*X2)+(Y1*Y2);
	
	var Length1=Math.sqrt((X1*X1)+(Y1*Y1));
	var Length2=Math.sqrt((X2*X2)+(Y2*Y2));
	
	var Angle=DotProduct/(Length1*Length2);
	
	Angle=Math.acos(Angle);
	
	return(Angle*180/Math.PI);
}
//*************************************************************************
// 
//*************************************************************************

/**
* Checks to see if a value is value (i.e. not NaN or null)
* (jjg - combine with IsDefined()?)
* @public
* @param Value
* @returns Flag
*/
CMUtilities.IsValid=function(Value)
{
	var Result=true;
	
	if (isNaN(Value)||(Value==null)) Result=false;
	
	return(Result);
}
//*************************************************************************
// Settings Utilities
//*************************************************************************

/**
* 
* @protected
* @param TheClass
* @returns SettingsDefinitions
*/
CMUtilities.AllSettingsDefinitions;

CMUtilities.GetSettingsDefinitions=function(ClassName)
{
	var Result=null;
	
	if (CMUtilities.AllSettingsDefinitions==undefined) CMUtilities.AllSettingsDefinitions={};
	
	var TheDefinitions=CMUtilities.AllSettingsDefinitions[ClassName];
	
	if (TheDefinitions==undefined)
	{
		var TheObject = new window[ClassName]();
		
		TheDefinitions=TheObject.GetSettingsDefinitions(); 
		
		CMUtilities.AllSettingsDefinitions[ClassName]=TheDefinitions;
	}
	
	return(TheDefinitions);
}


//CanvasMap/js/CMDataset.js
/*******************************************************************
* CMDataset Class
* This is effecitvely an abstract class that provides an API between
* the layer class and the data that may be shared between muliptle layers.
* The data typically contains individual spatial features with attributes
* But can also contain raster data organized as tiles.
* 
* Datasets are stored in a global CMDataset.TheDataSets[] array object
* @module CMDataset
* @Copyright HSU, Jim Graham, 2019
******************************************************************/

//******************************************************************
// Global Definitions
//******************************************************************
/**
* Types of data sets. These will load different Dataset handlers.
*
* @public, @enum
*/
CMDataset.GEOJSON=1;
CMDataset.PYRAMID=2;
CMDataset.PYRAMID_OPEN_FORMAT=3;
CMDataset.RASTER=4;
CMDataset.SQL=5;

/**
* Types of messages
* @protected
*/
CMDataset.MESSAGE_DATASET_LOADED=CMBase.GetUniqueNumber();
CMDataset.MESSAGE_DATASET_SELECTION_CHANGED=CMBase.GetUniqueNumber();
CMDataset.MESSAGE_DATASET_MOUSE_OVER_FEATURE_CHANGED=CMBase.GetUniqueNumber();
CMDataset.MESSAGE_ATTRIBUTES_CHANGED=CMBase.GetUniqueNumber();
CMDataset.MESSAGE_DATASET_TILE_LOADED=CMBase.GetUniqueNumber();

/**
* Status of requests to obtain data
*
* @protected, @enum
*/
CMDataset.LOAD_STATUS_NONE=1; // have not started a load yet
CMDataset.LOAD_STATUS_LOADING=2; // waiting for element to load
CMDataset.LOAD_STATUS_LOADED=3; // element had loaded and is ready to go
CMDataset.LOAD_STATUS_PENDING=4; // element is waiting in the que
CMDataset.LOAD_STATUS_CANCELED=5; // request was canceled, probably from the user changing the zoom level

/**
* Types of requrests
*
* @protected, @enum
*/
CMDataset.REQUEST_TYPE_IMAGE=1; // img element with a "src" attribute
CMDataset.REQUEST_TYPE_TEXT=2; // traditional REST request

//******************************************************************
// CMDataset Constructor
//******************************************************************
/*
* The que that stores the requests that are waiting to be requested.
* The que does not contain the CurrentRequest.  The que is a first in
* first out (FIFO) que.  
* @private
*/
CMDataset.RequestQue=[];
/*
* The current request that is being processed and then the one CMDataset is 
* waiting on to load.  The CurrentRequest is not in the que.
* @private
*/
CMDataset.CurrentRequest=null;

/*
* Called by the layers to make a request to obtain data.  Adds the request to the 
* que and executes it when all other requests are completed.  If successful,
* TheFunction() is called with TheRequest as the "this" object.
*
* @protected
* @param TheRequest - an HTML request object with the following fields:
*  		LoadStatus:CMDataset.LOAD_STATUS_NONE,
*		Type:CMDataset.REQUEST_TYPE_IMAGE,
*		TheImage:this.TheRaster,
*		src:ThePath,
*		TheFunction:function()
*		{ 
*			this.TheTile.TheDataset.GetParent(CMScene).Repaint();  // global
*		}
*/
CMDataset.MakeRequest=function(TheRequest)
{
	// add the request to itself so the function below can access it
	TheRequest.TheImage.TheRequest=TheRequest;
	
	// create the online function for this request
	TheRequest.TheImage.onload=function()
	{ 
		// set the status to loaded so the tile can be drawn
		this.TheRequest.LoadStatus=CMDataset.LOAD_STATUS_LOADED;
		
		// if there is another request in the que, make it now
		if (CMDataset.RequestQue.length>0)
		{
			CMDataset.CurrentRequest=CMDataset.RequestQue[0]; // get the request
			CMDataset.RequestQue.shift(); // remove the request from the que
			CMDataset.CurrentRequest.LoadStatus=CMDataset.LOAD_STATUS_LOADING; // was pending, about to be loading
			CMDataset.CurrentRequest.TheImage.src=CMDataset.CurrentRequest.src; // start the request
		}
		else // otherwise, reset the current request (all requests completed)
		{
			CMDataset.CurrentRequest=null;
		}
		// call the specified function (typically does a repaint)
		this.TheRequest.TheFunction();
	}
	
	// if this is the only request, start it now
	if (CMDataset.CurrentRequest==null)
	{
		CMDataset.CurrentRequest=TheRequest;
		TheRequest.LoadStatus=CMDataset.LOAD_STATUS_LOADING;
		TheRequest.TheImage.src=TheRequest.src;
	}
	else // otherwise, setup the request to be processed when the next request is loaded
	{
		TheRequest.LoadStatus=CMDataset.LOAD_STATUS_PENDING;
		CMDataset.RequestQue.push(TheRequest);
	}
}
/*
* Called by the scene when the zoom level is changed to reset the current
* requests for tiles.
* @protected
*/
CMDataset.ResetRequests=function()
{
	var CurrentRequests=CMDataset.RequestQue; // get the current requests
	
	CMDataset.RequestQue=[]; // reset the array of requests
	
	for (var i=0;i<CurrentRequests.length;i++)
	{
		var TheRequest=CurrentRequests[i];
		
		CurrentRequests[i]=null; // free up the array entry
		
		TheRequest.LoadStatus=CMDataset.LOAD_STATUS_CANCELED;
	}
}
//******************************************************************
// CMDataset Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMDataset() 
{
	CMBase.call(this);

	// properties
	this.SelectedFeature=-1; // currently selected feature
	this.MouseOverFeatureIndex=-1; // feature the mouse is currently over
}
CMDataset.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMDataset.prototype.contructor=CMDataset; // override the constructor to go to ours

//**************************************************************
// Item-like functions
//**************************************************************
CMDataset.prototype.SetVisible=function(Flag) 
{ 
	
}
//**************************************************************
// Functions for attributes
//**************************************************************
/**
* Returns the number of rows of attributes in the current dataset
* @override
* @public
* @returns - Number of rows or 0 if no data loaded
*/
CMDataset.prototype.GetNumAttributeRows=function() 
{ 
	return(0); 
}
/**
* Returns the number of columns of attributes in the current dataset
* @override
* @public
* @returns - Number of columns or 0 if no data loaded
*/
CMDataset.prototype.GetNumAttributeColumns=function() 
{ 
	return(0); 
}
/**
* Returns the a heading for a specified column
* @override
* @public
* @returns - Specified column heading or "" if no data loaded.
*/
CMDataset.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	return(""); 
}
/**
* Gets the contents of an attribute cell (row and column)
* @override
* @public
* @param ColumnIndex
* @param RowIndex
* @returns - Specified value or "" if no data loaded.
*/
CMDataset.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	return(""); 
}
/**
* Inserts a new column into the dataset with the specified heading and
* sets all values ni the column to the specified DefaultValue
* @override
* @public
* @param NewHeading
* @param DefaultValue
*/
CMDataset.prototype.AddAttributeHeading=function(NewHeading,DefaultValue) 
{ 
}

/**
* Sets the value of a cell in an attribute table using a row and column index.
* @override
* @public
* @param ColumnIndex
* @param RowIndex
* @param Value
*/
CMDataset.prototype.SetAttributeCell=function(ColumnIndex,RowIndex,Value) 
{ "use strict";
	this.SendMessageToListeners(CMDataset.MESSAGE_ATTRIBUTES_CHANGED);
};
/**
* Helper function to return an entire array for an attribute
* @public
* @param Heading - the atribute/column heading to get the array from
*/
CMDataset.prototype.GetAttributeArray=function(ColumnIndex) 
{ 
	var NumAttributeRows=this.GetNumAttributeRows();
	
	var Result=[];
	for (var i=0;i<NumAttributeRows;i++) 
	{
		Result[i]=this.GetAttributeCell(ColumnIndex,i);
	}
	return(Result); 
}
/**
* Makes sure the specified column of attributes is loaded.  The attributes
* are loaded when the dataset is loaded in some datasets such as a GeoJSON
* file.  Others are loaded as needed such as a Pyramid dataset or a database
* dataset.
*
* @override
* @protected
* @param Heading - the atribute/column to load
*/
CMDataset.prototype.LoadAttributeColumn=function(ColumnIndex) 
{ 
}
//**************************************************************
// Functions for Projectors
//**************************************************************
/**
* Sets up a projector for layer data to be projected on loading the data.
* @public
* @param NewProjector - an STProjector object to project layer data after it is loaded.
*/
CMDataset.prototype.SetProjector=function(NewProjector)
{
	this.TheProjector=NewProjector;
}
/**
* Gets the current projector used to project data on load.
* @public
* @returns - Current projector or null.
*/
CMDataset.prototype.GetProjector=function()
{
	return(this.TheProjector);
}


//**************************************************************
// Functions specifically for setting up data sets
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
* This is the base call and is typically overriden by subclasses.
* @protected, @override
* @param URL - URL to use to request data
* @param ZoomToBounds - true to have the current view zoom to the bounds of the data when received.
*/
CMDataset.prototype.SetURL=function(URL) 
{
	alert("TCMDataset.SetURL() should be overriden in a subclass");

};
/*
* Set the vector data from a GeoJSON object directly.
* @protected
* @override
* @param TheData - The GeoJSON object
*/
CMDataset.prototype.SetData=function(TheData) 
{
	this.TheData=TheData;
};
CMDataset.prototype.GetData=function() 
{
	return(this.TheData);
};

//******************************************************************
// CMData Mouse event handling
//******************************************************************
/**
* Returns the number of features in the dataset.
* @protected
* @returns - The number of features in the dataset, 0 for raster data sets
*/
CMDataset.prototype.GetNumFeatures=function() 
{
	return(0);
}
/**
* Checks if the specified coordinate is in the specified feature
* jjg - should we pass in the ClickTolerance?
* @protected
* @param TheView - the view that the RefX and RefY are in (used to determine click tolerances)
* @param RefX - X coordinate value for the point to test
* @param RefY - Y coordinate value for the point to test
* @param FeatureIndex - Index of the features to test
* @param RefTolerance - Tolerance for selecting features in reference units
*/
CMDataset.prototype.InFeature=function(TheView,RefX,RefY,FeatureIndex,RefTolerance) 
{
	return(false);
}
/**
* Checks if the specified coordintate is in a feature.
* jjg - should we pass in the ClickTolerance?
* @protected
* @param TheView - the view that the RefX and RefY are in (used to determine click tolerances)
* @param RefX - X coordinate value for the point to test
* @param RefY - Y coordinate value for the point to test
* @param RefTolerance - Tolerance for being in features in reference units
*/
CMDataset.prototype.In=function(TheView,RefX,RefY,RefTolerance) 
{
	var FeatureIndex=-1;
	return(FeatureIndex);
};
/*
* Paints a dataset into the specified view
* @protected. @override
* @param TheLayer - The layer that contains the data to be painted.
* @param TheView - View to paint the data into
* @param SelectedOnly - true to just paint the selected data otherwise all data will be painted.
*/
CMDataset.prototype.Paint=function(TheLayer,TheView,SelectedOnly) 
{
};


//******************************************************************
// CMData Searching Functions
//******************************************************************

/*
* Requests search results from a layer.  
* @protected - typically called by the layer
*/
CMDataset.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{

}
/**
* Called by parent layer to get an icon that may be specific to this type of layer
* @protected - typically called by the layer
*/
CMDataset.prototype.GetIcon=function(TheLayer,Default) 
{
	return(Default);
}
/**
* Sets the selected feature based on its index.
* @protected - typically called by the layer
* @param NewSelectedFeatureIndex - Index to the feature that is now to be selected.
*/
CMDataset.prototype.SetSelectedFeature=function(NewSelectedFeatureIndex) 
{
	if (this.SelectedFeature!=NewSelectedFeatureIndex)
	{
		var TheScene=this.GetParent(CMScene);
		TheScene.UnselectAll(true);
		
		this.SelectedFeature=NewSelectedFeatureIndex;
		this.SendMessageToListeners(CMDataset.MESSAGE_DATASET_SELECTION_CHANGED);
	}
}
CMDataset.prototype.UnselectAll=function(SendMessageFlag) 
{
	if (this.SelectedFeature!=-1) // something is selected
	{ 
		this.SelectedFeature=-1;
		
		if (SendMessageFlag) // call the scene to let everyone know the selection changed
		{
			// call the scene to let everyone know the selection changed
			var TheScene=this.GetParent(CMScene);
			TheScene.SelectionChanged(this);
		}
	}
}
/**
*
*/
CMDataset.prototype.GetSelected=function() 
{
	var Result=false;
	
	if (this.SelectedFeature!=-1) Result=true;
	
	return(Result);
}
CMDataset.prototype.GetSelectedFeature=function() 
{
	return(this.SelectedFeature);
}
/**
* Sets the selected feature based on its index.
* @protected - typically called by the layer
* @param NewSelectedFeatureIndex - Index to the feature that is now to be selected.
*/
CMDataset.prototype.SetMouseOverFeature=function(NewMouseOverFeatureIndex) 
{
	if (this.MouseOverFeatureIndex!=NewMouseOverFeatureIndex)
	{
		this.MouseOverFeatureIndex=NewMouseOverFeatureIndex;
		this.SendMessageToListeners(CMDataset.MESSAGE_DATASET_MOUSE_OVER_FEATURE_CHANGED);
	}
}
/**
*
*/
CMDataset.prototype.GetMouseOverFeature=function() 
{
	return(this.MouseOverFeatureIndex);
}


//******************************************************************
// Public CMDataset functions
//******************************************************************

/**
* Add a new point to the GeoJSON data
*/
CMDataset.prototype.AddPoint=function(X,Y)
{
}

//******************************************************************
// CMData static Functions
//******************************************************************
/*
* This is the one static array that contains all the data sets used in the current
* instance of CanvasMap.  This allows maps to share data reducing memory and network
* overhead.
* @private
*/
CMDataset.TheDataSets=[];

/*
* Returns an appropriate data object for the request.  called by CMLayerDataset to
* obtain a new or existing dataset.
* @protected, @static
* @param URL - URL to the data to load into the dataset
* @param DataSetType - Type of data from the CMDataset types.
*/
CMDataset.GetDataObject=function(URL,DataSetType) 
{
	var TheDataSet=null;
	
	// look for the data set in the existing data sets
	if (URL!=null)
	{
		for (var i=0;(i<CMDataset.TheDataSets.length)&&(TheDataSet==null);i++)
		{
			if (CMDataset.TheDataSets[i].URL==URL) TheDataSet=CMDataset.TheDataSets[i];
		}
	}
	// if the data set was not found, create a new one
	if (TheDataSet==null) // did not find the dataset
	{
		switch (DataSetType)
		{
		case CMDataset.GEOJSON:
		case undefined:
			TheDataSet=new CMDatasetGeoJSON();
			break;
		case CMDataset.PYRAMID:
			TheDataSet=new CMDatasetPyramid();
			break;
		case CMDataset.PYRAMID_OPEN_FORMAT:
			TheDataSet=new CMDatasetPyramidOpenFormat();
			break;
		case CMDataset.RASTER:
			TheDataSet=new CMDatasetRaster();
			break;
		case CMDataset.SQL:
			TheDataSet=new CMDatasetSQL();
			break;
		}
//		TheDataSet.SetParent(this);
		
		CMDataset.TheDataSets.push(TheDataSet);
	}
	return(TheDataSet);
}

//CanvasMap/js/CMDatasetVector.js
/******************************************************************************************************************
* CMDatasetVector
* This is effecitvely an abstract class that provides an API between
* the layer class and the data that may be shared between muliptle layers.
* The data typically contains individual spatial features with attributes
* But can also contain raster data organized as tiles.
*
* @module CMDatasetVector
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Global Definitions
//******************************************************************

CMDatasetVector.TYPE_POINTS=1;
CMDatasetVector.TYPE_POLYLINES=2;
CMDatasetVector.TYPE_POLYGONS=3;

//******************************************************************
// CMDatasetVector Constructor
//******************************************************************

//******************************************************************
// CMDatasetVector Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMDatasetVector() 
{
	CMDataset.call(this);

	// properties
	this.TheRegions=null; // standard regions
	this.Type=null; // type of primitives in the regions
	
	// attributes
	this.ColumnHeadings=[];
	this.Columns=[];
}
CMDatasetVector.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetVector.prototype.contructor=CMDatasetVector; // override the constructor to go to ours

//**************************************************************
// Prviate functions
//**************************************************************

/**
* Get the boounds of the specified data in GeoJSON Format
* @private
* @param TheData - An object containing GeoJSON data
* @returns - An object containining: xMin,xMax,yMin,yMax
*/
CMDatasetVector.GetBoundingBoxFromRegion=function(TheRegion) 
{
	var TheFeatureBounds=null;

	for (var AreaIndex=0; AreaIndex < TheRegion.length; AreaIndex++) 
	{
		var TheArea=TheRegion[AreaIndex];
		
		var TheExterior=TheArea[0];
		
		var Xs=TheExterior[0];
		var Ys=TheExterior[1];
		
		for (var i=0;i<Xs.length;i++)
		{
			if (TheFeatureBounds==null)
			{
				TheFeatureBounds={
					XMin:Xs[i],
					XMax:Xs[i],
					YMin:Ys[i],
					YMax:Ys[i]
				}
			}
			else
			{
				// Update the TheBounds recursively by comparing the current
				// xMin/xMax and yMin/yMax with the coordinate 
				// we're currently checking
				if (TheFeatureBounds.XMin > Xs[i]) TheFeatureBounds.XMin =Xs[i];
				if (TheFeatureBounds.XMax < Xs[i]) TheFeatureBounds.XMax=Xs[i];
				if (TheFeatureBounds.YMin >Ys[i]) TheFeatureBounds.YMin =Ys[i];
				if (TheFeatureBounds.YMax < Ys[i]) TheFeatureBounds.YMax =Ys[i];
			}
		}
	}
	return(TheFeatureBounds);
}
CMDatasetVector.prototype.SetupBoundingBoxesFromRegions=function(TheRegions) 
{
	var TheBounds=null;
	this.FeatureBounds=[];
	
	if (TheRegions!=null)
	{
		// Loop through each region
		for (var RegionIndex=0; RegionIndex < TheRegions.length; RegionIndex++) 
		{
			var TheRegion=TheRegions[RegionIndex];
			
			var TheFeatureBounds=CMDatasetVector.GetBoundingBoxFromRegion(TheRegion);
			
			if (TheBounds==null) 
			{
				TheBounds=CMUtilities.CloneBounds(TheFeatureBounds);
			}
			else
			{
				CMUtilities.AddToBounds(TheBounds,TheFeatureBounds);
			}
			this.FeatureBounds[RegionIndex]=TheFeatureBounds;
		}
		this.TheBounds=TheBounds;
	}
}
//**************************************************************
// Protected CMDatasetVector Functions for attributes
//**************************************************************
/**
* @protected
*/
CMDatasetVector.prototype.SetAttributes=function(NewColumnHeadings,NewColumns) 
{ 
	this.ColumnHeadings=NewColumnHeadings;
	this.Columns=NewColumns;
	this.SendMessageToListeners(CMDataset.MESSAGE_ATTRIBUTES_CHANGED);
}
//**************************************************************
// public Functions for Bounds
//**************************************************************

/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Bounds with format {XMin,XMax,YMin,YMax}
*/
CMDatasetVector.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMDatasetVector.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}
CMDatasetVector.prototype.GetFeatureBounds=function(FeatgureIndex) 
{
	return(this.FeatureBounds[FeatgureIndex]);
}
//**************************************************************
// CMData Functions for attributes
//**************************************************************

CMDatasetVector.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	
	if (this.Columns.length>0) Result=this.Columns[0].length;
	
	return(Result); 
}

CMDatasetVector.prototype.GetNumAttributeColumns=function() 
{ 
	return(this.ColumnHeadings.length); 
}

CMDatasetVector.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	return(this.ColumnHeadings[ColumnIndex]); 
}

CMDatasetVector.prototype.GetAttributeHeadings=function(ColumnIndex) 
{ 
	return(this.ColumnHeadings); 
}

CMDatasetVector.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	return(this.Columns[ColumnIndex][RowIndex]); 
}

CMDatasetVector.prototype.AddAttributeHeading=function(NewHeading,DefaultValue) 
{ 
	this.ColumnHeadings.push(NewHeading);
	
	var TheColumn=[];
	
	var NumRows=this.GetNumAttributeRows();
	
	for (var i=0;i<NumRows;i++) TheColumn[i]=DefaultValue;
	
	this.Columns.push(TheColumn);
}


CMDatasetVector.prototype.GetAttributeCellByHeading=function(Heading,RowIndex)  //jjg
{ 
	var Result=null;
	
	var ColumnIndex=this.ColumnHeadings.indexOf(Heading);
	
	if (ColumnIndex==-1) 
	{
		throw("Sorry, the heading "+Heading+" was not found");
	}
	else
	{
		Result=this.GetAttributeCell(ColumnIndex,RowIndex);
	}
	return(Result);
}
CMDatasetVector.prototype.GetAttributeIndexFromHeading=function(Heading) 
{ 
	var ColumnIndex=this.ColumnHeadings.indexOf(Heading);
	
	return(ColumnIndex); 
}

CMDatasetVector.prototype.SetAttributeCell=function(ColumnIndex,RowIndex,Value) 
{ "use strict";
	this.Columns[ColumnIndex][RowIndex]=Value;
	
	this.SendMessageToListeners(CMDataset.MESSAGE_ATTRIBUTES_CHANGED);
};
/*
CMDatasetVector.prototype.SetAttributeCellByHeading=function(Heading,RowIndex,Value)  // jjg dgoing away
{ 
	var ColumnIndex=this.ColumnHeadings.indexOf(Heading);
	
	var Result=this.SetAttributeCell(ColumnIndex,RowIndex,Value);
};*/
//******************************************************************
// CMData Mouse event handling
//******************************************************************
CMDatasetVector.prototype.GetNumFeatures=function() 
{
	var Result=0;
	if (this.TheRegions!=null) Result=this.TheRegions.length;
	return(Result);
}

CMDatasetVector.prototype.In=function(TheView,RefX,RefY,RefTolerance) 
{
	var FeatureIndex=-1;
	
	if ((this.TheRegions!=null)) 
	{
		// Loop over the features
		for (var i=0;( i < this.TheRegions.length)&&(FeatureIndex==-1); i++) 
		{
			var Result=this.InFeature(TheView,RefX,RefY,i,RefTolerance);
			
			if (Result) FeatureIndex=i;
		}
	}
	return(FeatureIndex);
}
/**
* Checks if the specified coordinate is in the specified feature
*/
CMDatasetVector.prototype.InFeature=function(TheView,RefX,RefY,FeatureIndex,RefTolerance) 
{
	var Result=false;
	
	if (this.TheRegions!=null) 
	{
		//var RefTolerance=TheView.GetRefWidthFromPixelWidth(this.ClickTolerance);
		
		switch (this.Type)
		{
		case CMDatasetVector.TYPE_POINTS:
			{
				var TheRegion=this.TheRegions[FeatureIndex];
				
				for (var i=0;(i<TheRegion.length)&&(Result==false);i++)
				{
					var TheArea=TheRegion[i];
					
					var ThePoly=TheArea[0];
					
					var X=ThePoly[0][0];
					var Y=ThePoly[1][0];
					
					if ((Math.abs(X-RefX)<=RefTolerance)&&(Math.abs(Y-RefY)<=RefTolerance))
					{
						Result=true;
					}
				}
			}
			break;
		case CMDatasetVector.TYPE_POLYLINES:
			{
				var TheRegion=this.TheRegions[FeatureIndex];
				
				for (var i=0;(i<TheRegion.length)&&(Result==false);i++)
				{
					var TheArea=TheRegion[i];
					
					var ThePoly=TheArea[0];
					
					var Xs=ThePoly[0];
					var Ys=ThePoly[1];
					
					Result=CMUtilities.InPolyline(RefX,RefY,Xs,Ys,RefTolerance);
				}
			}
			break;
			
		case CMDatasetVector.TYPE_POLYGONS:
			{
				var TheRegion=this.TheRegions[FeatureIndex];
				
				for (var i=0;(i<TheRegion.length)&&(Result==false);i++)
				{
					var TheArea=TheRegion[i];
					
					var ThePoly=TheArea[0];
					
					var Xs=ThePoly[0];
					var Ys=ThePoly[1];
					
					Result=CMUtilities.InsideAPolygon(RefX,RefY,Xs,Ys,Xs.length);
				}
			}
			break;
		}
	}
	return(Result);
};

//******************************************************************
// CMData Painting Functions
//******************************************************************
/*
* Paints the specified data into the view.
* 
*/
CMDatasetVector.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
	if ((TheView instanceof CMView2D)&&(this.TheRegions!=null)) //(this.GetVisible())&&
	{
		if (MouseOverOnly==undefined) MouseOverOnly=false;
		
		var ViewBounds=TheView.GetBounds();
			
		// draw each feature
		for (var FeatureIndex=0; FeatureIndex < this.TheRegions.length; FeatureIndex++) 
		{
			// jjg - not the most efficient approach
			var Draw=false; 
			if ((SelectedOnly==false)&&(MouseOverOnly==false))
			{
				Draw=true;
			}
			else if ((SelectedOnly)&&(this.SelectedFeature==FeatureIndex)) 
			{
				Draw=true;
			}
			else if ((MouseOverOnly)&&(this.MouseOverFeatureIndex==FeatureIndex)) 
			{
				Draw=true;
			}
			if (Draw)
			{
				var TheFeatureBounds=this.GetFeatureBounds(FeatureIndex);
				
				var TheGeo=TheLayer.GetParent(CMGeo);
				
				if ((CMUtilities.BoundsOverlap(ViewBounds,TheFeatureBounds))||
					(TheGeo.GetProjectorType()==CMGeo.PROJECTOR_DYNAMIC)) // jjg - needs to support dynamic projection
				{
					var Result=false;
					if (this.Type==CMDatasetVector.TYPE_POINTS) // draw a point as an icon or a mark
					{
						var TheRegion=this.TheRegions[FeatureIndex];
						
						var TheArea=TheRegion[0];
						
						var ThePoly=TheArea[0];
						
						TheLayer.PaintPoint(TheView,FeatureIndex,ThePoly[0][0],ThePoly[1][0],SelectedOnly,MouseOverOnly);
					}
					else // draw a polyline or polygon
					{
						if (this.TheRegions!=null)
						{
							var TheRegion=this.TheRegions[FeatureIndex];
							
							for (var i=0;i<TheRegion.length;i++)
							{
								var TheArea=TheRegion[i];
								
								TheLayer.PaintRefArea(TheView,FeatureIndex,TheArea,this.Type,SelectedOnly,MouseOverOnly);
							}
						}
					}
				}
			}
		}
	}
}

//******************************************************************
// CMLayer Searching Functions
//******************************************************************
/*
* Requests search results from a layer.  The scene calls this function.
*/
CMDatasetVector.prototype.SearchColumn=function(ColumnIndex,SearchPhrase) 
{
	var Result=[];
	
	if ((this.Columns!=null)) //(this.GetVisible())&&
	{
		SearchPhrase=SearchPhrase.toLowerCase();
		
		var TheColumn=this.Columns[ColumnIndex];
		
		for (var j=0;j<TheColumn.length;j++)
		{
			var TheProperty=TheColumn[j];
			
			if (typeof(TheProperty)!="string") TheProperty=""+TheProperty;
			
			TheProperty=TheProperty.toLowerCase();
			
			if (TheProperty.indexOf(SearchPhrase)!=-1)
			{
				Result.push(j);
			}
		}
	}
	return(Result);
}

/*
* Requests search results from a layer.  The scene calls this function.
*/
CMDatasetVector.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
	if ((this.Columns!=null)) //(this.GetVisible())&&
	{
		// draw each feature
		for (var i=0; i < this.Columns.length; i++) 
		{
			var TheColumn=this.Columns[i];
			
			for (var j=0;j<TheColumn.length;j++)
			{
				var TheProperty=TheColumn[j];
				
				if (typeof(TheProperty)=="string")
				{
					TheProperty=TheProperty.toLowerCase();
					
					if (TheProperty.indexOf(SearchPhrase)!=-1)
					{
						var ThisResult=document.createElement("DIV");
						ThisResult.innerHTML=TheProperty;
						ThisResult.className="CM_SearchResult";
						
						ThisResult.TheDataset=this;
						ThisResult.FeatureIndex=j;
						
						// setup function called when user clicks on search result
						ThisResult.onclick=function()
						{
							var TheScene=this.TheDataset.GetParent(CMScene);
							TheScene.UnselectAll();
							this.TheDataset.SetSelectedFeature(this.FeatureIndex);
							
							var TheBounds=this.TheDataset.FeatureBounds[this.FeatureIndex];
							var TheView=TheScene.GetView(0);
							
							//this.className="CM_SearchResultSelected";
							
							TheView.ZoomToBounds(TheBounds);
						}
						ResultsPanel.appendChild(ThisResult);
						
						Found=true;
					}
				}
			}
		}
	}
}

CMDatasetVector.prototype.CMDataset_GetIcon=CMDataset.prototype.GetIcon;

CMDatasetVector.prototype.GetIcon=function(TheLayer,Default)
{
	var TheIcon=this.CMDataset_GetIcon(TheLayer,Default);
	
	if ((this.TheRegions!=null)) //
	{
		switch (this.Type)
		{
		case CMDatasetVector.TYPE_POLYLINES:
			{
				TheIcon=document.createElement('CANVAS');
				TheIcon.className="CM_LayerListIconClass";
				TheIcon.TheLayer=this;
				TheIcon.style.borderColor="rgba(0,0,0,0)";
				
				TheIcon.width=16;
				TheIcon.height=16;
				
				var TheView=new CMView2D();
				TheView.Setup(TheIcon);
					
				var StrokeStyle=TheLayer.GetSetting("Style","strokeStyle");
				var LineWidth=TheLayer.GetSetting("Style","lineWidth");
	
				var TheContext = TheIcon.getContext("2d");
				TheContext.strokeStyle=StrokeStyle;
				TheContext.lineWidth=LineWidth;
				
				TheContext.moveTo(0,0);
				TheContext.lineTo(16,16);
				TheContext.moveTo(0,16);
				TheContext.lineTo(7,7);
				TheContext.stroke();
			}
			break;
		case CMDatasetVector.TYPE_POINTS:
			{
				var TheType=TheLayer.GetSetting("Mark","Type",undefined);
		
				if (TheType==undefined) TheType=CMLayer.MARK_CIRCLE;
				
				var StrokeStyle=TheLayer.GetSetting("Style","strokeStyle");
				var FillStyle=TheLayer.GetSetting("Style","fillStyle");
				TheIcon=TheLayer.GetMarkIcon(TheType,FillStyle,StrokeStyle);
			}
			break;
		}
	}
	return(TheIcon);
}

//******************************************************************
// Public CMDatasetVector functions
//******************************************************************

/**
* Add a new point to the data
* @public
*/
CMDatasetVector.prototype.AddPoint=function(X,Y,Z)
{
	var Projector=this.GetProjector();
	
	if (Projector!=null)
	{
		var Result=Projector.ProjectFromGeographic(X,Y);
		X=Result[0];
		Y=Result[1];
	}

	if (this.TheRegions==null) 
	{
		this.TheRegions=[];
		this.Type=CMDatasetVector.TYPE_POINTS;
	}
	var ThePoly=[[X],[Y]];
	if (Z!=undefined) ThePoly.push([Z]);
	
	// create the region
	var TheArea=[ThePoly];
	var TheRegion=[TheArea];
	this.TheRegions.push(TheRegion);
	
	this.SetupBoundingBoxesFromRegions(this.TheRegions);

}

CMDatasetVector.prototype.AddPolyline=function(Xs,Ys,Zs)
{
	this.AddPoly(CMDatasetVector.TYPE_POLYLINES,Xs,Ys,Zs);
}

CMDatasetVector.prototype.AddPolygon=function(Xs,Ys,Zs)
{
	this.AddPoly(CMDatasetVector.TYPE_POLYGONS,Xs,Ys,Zs);
}

/**
* Add a new polyline to the data
* @public
*/
CMDatasetVector.prototype.AddPoly=function(Type,Xs,Ys,Zs)
{
	var Projector=this.GetProjector();
	
	if (Projector!=null)
	{
		var Result=Projector.ProjectFromGeographic(Xs,Ys);
		Xs=Result[0];
		Ys=Result[1];
	}

	if (this.TheRegions==null) 
	{
		this.TheRegions=[];
		this.Type=Type;
	}
	var ThePoly=[Xs,Ys];
	if (Zs!=undefined) ThePoly.push(Zs);
	
	var TheArea=[ThePoly];
	var TheRegion=[TheArea];
	this.TheRegions.push(TheRegion);
	
	this.SetupBoundingBoxesFromRegions(this.TheRegions);
}
/**
* Add a new point to the data
* @public
*/
CMDatasetVector.prototype.SetPosition=function(RegionIndex,AreaIndex,PolyIndex,CoordinateIndex,Position)
{
	var ThePoly=this.TheRegions[RegionIndex][AreaIndex][PolyIndex];
	
	ThePoly[0][CoordinateIndex]=Position.x;
	ThePoly[1][CoordinateIndex]=Position.y;
	if (ThePoly.length>2) ThePoly[2][CoordinateIndex]=Position.z;
	
	this.SetupBoundingBoxesFromRegions(this.TheRegions);
}

//**************************************************************
// Public CMDatasetVector Functions for attributes
//**************************************************************
/*
* Set the vector data from a GeoJSON object
*/
CMDatasetVector.prototype.GetRegions=function() 
{
	return(this.TheRegions);
}
CMDatasetVector.prototype.GetType=function() 
{
	return(this.Type);
}

//CanvasMap/js/CMDatasetGeoJSON.js
/*******************************************************************
* CMDatasetGeoJSON Class
* 
* @module CMDatasetGeoJSON
* @Copyright HSU, Jim Graham, 2019
******************************************************************/
//******************************************************************
// CMDatasetGeoJSON Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMDatasetGeoJSON() 
{
	CMDatasetVector.call(this);
}
CMDatasetGeoJSON.prototype=Object.create(CMDatasetVector.prototype); // inherit prototype functions from PanelBase()

CMDatasetGeoJSON.prototype.contructor=CMDatasetGeoJSON; // override the constructor to go to ours
//**************************************************************
// Functions specifically for vector data
//**************************************************************

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMDatasetGeoJSON.prototype.SetURL=function(URL) 
{
	if (this.URL!=URL)
	{
		this.URL=URL;
		
		var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
		TheRequest.open("GET",URL,true); // the URL is what we ordered
		TheRequest.TheURL=URL;
		TheRequest.TheDataset=this;
		//TheRequest.ZoomToBounds=ZoomToBounds;
				
		TheRequest.onreadystatechange=function() 
		{
			if (this.readyState == 4)  // done
			{
				if (this.status == 200) // OK
				{
					var TheText=this.responseText;
	
					// clip the data if ClipBoundary is set
					var TheGeoJSONObject=JSON.parse(TheText);
				
					this.TheDataset.SetGeoJSON(TheGeoJSONObject);
					
					// update the debuging panel if set
	
					if (this.TheDataset.GetParent(CMMainContainer)!=null)
					{
					}
					
					// call the layer's specified on load function if provided
					{
	//					this.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_DATASET_LOADED);
					}
					
				}
				else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
			}
		}
		TheRequest.send();
	}
};

CMDatasetGeoJSON.prototype.SaveDataToURL=function(URL)
{
	var TheGeoJSON=this.GetGeoJSONFeatures();
	
	var TheGeoJSONText=JSON.stringify(TheGeoJSON);
	
	URL=URL+encodeURI("?Data="+TheGeoJSONText);
	
	var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
	//TheRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	TheRequest.open("PUT",URL,true); // the URL is what we ordered
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this;
			
	TheRequest.onreadystatechange=function() 
	{
		if (this.readyState == 4)  // done
		{
			if (this.status == 200) // OK
			{
				var TheText=TheRequest.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
				
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send(TheGeoJSONText);
}
//**********************************************************************
// CMDatasetGeoJSON functions to get and set the GeoJSON-based data
//**********************************************************************

/**
* Sets just the features within this dataset.
* @public
* @param - TheGeoJSONObject a valid GeoJSON object containing features.  The
*			object passed in must have a "features" array containing valid
*			GeoJSON features).
*/
CMDatasetGeoJSON.prototype.SetGeoJSONFeatures=function(TheGeoJSONObject)
{
	this.TheRegions=[];
	
	this.Type=CMDatasetGeoJSON.GetRegionsFromGeoJSON(TheGeoJSONObject,this.TheRegions);
	
	// project the data if needed
	
	var TheProjector=this.GetProjector();
	
	if ((TheProjector!=null)&&(true)) // project the data without saving original - jjg should we ave the original for a later projection?
	{
		this.TheRegions=TheProjector.ProjectRegionsFromGeographic(this.TheRegions,this.Type);
	}
	
	// save the data in the data object
	
	this.SetupBoundingBoxesFromRegions(this.TheRegions);
	
	// zoom to the data
	
/*	if (ZoomToBounds)
	{
		var TheMainContainer=this.GetParent(CMMainContainer);
		
		TheMainContainer.ZoomToBounds(this.GetBounds());
	}
*/
	this.SendMessageToListeners(CMDataset.MESSAGE_DATASET_LOADED);
}
/**
* Set this dataset to match a GeoJSON object.  This will replace any existing data
* @public
* @param TheGeoJSONObject - A GeoJSON object witha "features" object and optional "properties" object.
* @param ZoomToBounds - optional flag 
*/
CMDatasetGeoJSON.prototype.SetGeoJSON=function(TheGeoJSONObject)
{
	// get the attribute headings
	
	var NumColumns=0;
	var Headings=[];
	
	var Properties=TheGeoJSONObject.features[0].properties;
	
	for (var key in Properties) 
	{
		Headings.push(key);
		NumColumns++;
	}
	// setup the attribute columns
	
	var NumRows=TheGeoJSONObject.features.length;
	var Columns=[];
	for (var ColumnIndex=0;ColumnIndex<NumColumns;ColumnIndex++)
	{
		var Cells=[];
		var Heading=Headings[ColumnIndex];
		
		for (var RowIndex=0;RowIndex<NumRows;RowIndex++)
		{
			var Properties=TheGeoJSONObject.features[RowIndex].properties;
			
			Cells.push(Properties[Heading]);
		}
		Columns.push(Cells);
	}
	
	this.SetAttributes(Headings,Columns);
	
	// set the features and supress messages until we process the attributes
	this.SetGeoJSONFeatures(TheGeoJSONObject);
}

//**********************************************************************
// Public static functions to convert GeoJSON to CanvasMap vector types
//**********************************************************************
CMDatasetGeoJSON.GetAreaFromGeoJSON=function(GeoJSONArea,Closed)
{
	var NewArea=[];
	
	if (GeoJSONArea!=undefined)
	{
		for (var i=0;i<GeoJSONArea.length;i++)
		{
			var ThePoly=GeoJSONArea[i];
			
			var Xs=[];
			var Ys=[];
			
			var NumCoordinates=ThePoly.length;
			if (Closed) NumCoordinates-=1; // remove last coordinate from closing GeoJSON poly
			
			for (var j=0;j<NumCoordinates;j++)
			{
				Xs.push(ThePoly[j][0]);
				Ys.push(ThePoly[j][1]);
			}
			NewArea.push([Xs,Ys]);
		}
	}
	return(NewArea);
}

/*
* Paint a geometry that is in reference coordinates (i.e. GeoJSON)
* @private
* @param TheGeometry
*/
CMDatasetGeoJSON.GetRegionFromGeoJSONGeometry=function(TheGeometry,Region)
{
	var Type=null;
	
	//if (Region==undefined) Region=[];
	
	if (TheGeometry.type=="Point")
	{
		var GeoJSONArea=[[TheGeometry.coordinates]]; // x and y
		
		var NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(GeoJSONArea,false);
	
		if (NewArea!=null) Region.push(NewArea);
		
		Type=CMDatasetVector.TYPE_POINTS;
	}
	else if (TheGeometry.type=="LineString")
	{
		var GeoJSONArea=[TheGeometry.coordinates];
		
		var NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(GeoJSONArea,false);
	
		if (NewArea!=null) Region.push(NewArea);
		
		Type=CMDatasetVector.TYPE_POLYLINES;
	}
	else if (TheGeometry.type=="MultiLineString")
	{
		// for a multiline string, each string is a set of line segments in an area (i.e. a connected stream or road network)
		for (var j=0;j<TheGeometry.coordinates.length;j++)
		{
			var GeoJSONArea=[TheGeometry.coordinates[j]];
		
			var NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(GeoJSONArea,false);
		
			if (NewArea!=null) Region.push(NewArea);
		}
		
		Type=CMDatasetVector.TYPE_POLYLINES;
	}
	else if (TheGeometry.type=="Polygon") // really an array of polygons (an area with optional holes)
	{
		var GeoJSONArea=[];
		
		for (var j=0;j<TheGeometry.coordinates.length;j++) // first polygon is exterior, others are interior (this needs to be cached)
		{
			GeoJSONArea.push(TheGeometry.coordinates[j]);
		}
		var NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(GeoJSONArea,true);
	
		if (NewArea!=null) Region.push(NewArea);
		
		Type=CMDatasetVector.TYPE_POLYGONS;
	}
	else if (TheGeometry.type=="MultiPolygon") // multiple areas each which can contain multiple polygons
	{
		for (var i=0;i<TheGeometry.coordinates.length;i++) // each loop is a separate area
		{
			var GeoJSONArea=[];
		
			var TheCoordinateArrays=TheGeometry.coordinates[i];
			
			for (var j=0;j<TheCoordinateArrays.length;j++) // first polygon is exterior, others are interior (this needs to be cached)
			{
				GeoJSONArea.push(TheCoordinateArrays[j]);
			}
			var NewArea=CMDatasetGeoJSON.GetAreaFromGeoJSON(GeoJSONArea,true);
		
			if (NewArea!=null) Region.push(NewArea);
		}
		
		Type=CMDatasetVector.TYPE_POLYGONS;
	}
	else if (TheGeometry.type=="GeometryCollection")
	{
		for (var j=0;j<TheGeometry.geometries.length;j++)
		{
			Type=CMDatasetGeoJSON.GetRegionFromGeoJSONGeometry(TheGeometry.geometries[j],Region);
		}
	}
	return(Type);
}
/**
* @private
*/
CMDatasetGeoJSON.GetRegionsFromGeoJSON=function(GeoJSONData,Regions)
{
	var Result=null;
	
	var TheFeatures=GeoJSONData.features;

	// Loop through each feature
	for (var i=0; i < TheFeatures.length; i++) 
	{
		var TheGeometry=TheFeatures[i].geometry;
		
		var TheRegion=[];
		
		var Type=CMDatasetGeoJSON.GetRegionFromGeoJSONGeometry(TheGeometry,TheRegion);
		
		if (Type!=null) Result=Type;
		
		Regions.push(TheRegion);
	}
	return(Result);
}
//**********************************************************************
// Public static functions to convert CanvasMap vector types to GeoJSON
//**********************************************************************
CMDatasetGeoJSON.GetGeoJSONCoordinatesFromPoly=function(ThePoly,TheType)
{
	var GeoJSONPoly=[];
	
	if (ThePoly!=undefined)
	{
		var Xs=ThePoly[0];
		var Ys=ThePoly[1];
		
		for (var j=0;j<Xs.length;j++)
		{
			GeoJSONPoly.push([Xs[j],Ys[j]]);
		}
		// have to loop back to the first point for a GeoJSON polygon
		if (TheType==CMDatasetVector.TYPE_POLYGONS) GeoJSONPoly.push([Xs[0],Ys[0]]);
	}
	return(GeoJSONPoly);
}
CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea=function(TheArea,TheType)
{
	var NewGeoJSONArea=[];
	
	if (TheArea!=undefined)
	{
		for (var i=0;i<TheArea.length;i++) // go through the polys
		{
			var ThePoly=TheArea[i];
			
			var GeoJSONPoly=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromPoly(ThePoly,TheType);
			
			NewGeoJSONArea.push(GeoJSONPoly);
		}
	}
	return(NewGeoJSONArea);
}
CMDatasetGeoJSON.GetGeoJSONCoordinatesFromRegion=function(TheRegion,TheType)
{
	var NewGeoJSONRegion=[];
	
	if (TheRegion!=undefined)
	{
		for (var i=0;i<TheRegion.length;i++) // go through the polys
		{
			var TheArea=TheRegion[i];
			
			var GeoJSONPoly=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea(TheArea,TheType);
			
			NewGeoJSONRegion.push(GeoJSONPoly);
		}
	}
	return(NewGeoJSONRegion);
}
CMDatasetGeoJSON.GetGeoJSONGeometryFromRegion=function(TheRegion,TheType)
{
	var GeoJSONGeometry="";
	
	switch (TheType)
	{
	case CMDatasetVector.TYPE_POINTS:
		{
			TheCoordinates=[];
			
			//for (var i=0;i<TheRegion.length;i++)
			{
				var TheArea=TheRegion[0];
				
				var ThePoly=TheArea[0];
				
				var X=ThePoly[0][0];
				var Y=ThePoly[1][0];
				
				TheCoordinates=[X,Y];
			}
			GeoJSONGeometry={
				"type":"Point",
				"coordinates":TheCoordinates
			}
		}
		break;
	case CMDatasetVector.TYPE_POLYLINES:
		{
			if (TheRegion.length==1) // Line string
			{
				var TheArea=TheRegion[0];
				
				var ThePoly=TheArea[0];
				
				var TheCoordinates=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromPoly(ThePoly,TheType);
				
				GeoJSONGeometry={
					"type":"LineString",
					"coordinates":TheCoordinates
				}
			}
			else // MultilineString
			{
				var TheArea=TheRegion[0];
				
				var TheCoordinates=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea(TheArea,TheType);
				
				GeoJSONGeometry={
					"type":"MultiLineString",
					"coordinates":TheCoordinates
				}
			}
		}
		break;
	case CMDatasetVector.TYPE_POLYGONS:
		{
			if (TheRegion.length==1) // polygon 
			{
				var TheArea=TheRegion[0];
				
				var ThePoly=TheArea[0];
				
				var TheCoordinates=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromArea(TheArea,TheType);
				
				GeoJSONGeometry={
					"type":"Polygon",
					"coordinates":TheCoordinates
				}
			}
			else // MultilineString
			{
				var TheCoordinates=CMDatasetGeoJSON.GetGeoJSONCoordinatesFromRegion(TheRegion,TheType);
				
				GeoJSONGeometry={
					"type":"MultiPolygon",
					"coordinates":TheCoordinates
				}
			}
		}
		break;
	}
	return(GeoJSONGeometry);

}
/**
* Converts the contents of the Dataset to a GeoJSON object
*/ 
CMDatasetGeoJSON.prototype.GetGeoJSONFeatures=function()
{
	var TheFeatures=[];
	
	var TheRegions=this.GetRegions();
	var TheType=this.GetType();
	
	var TheHeadings=this.GetAttributeHeadings();
	
	for (var i=0;i<TheRegions.length;i++)
	{
		var TheRegion=TheRegions[i];
		
		var TheGeoJSONGeometry=CMDatasetGeoJSON.GetGeoJSONGeometryFromRegion(TheRegion,TheType);
		
		var TheProperties={};
		
		for (var j=0;j<TheHeadings.length;j++)
		{
			TheProperties[TheHeadings[j]]=this.GetAttributeCell(j,i);
		}
		
		var TheFeature={
			"type":"Feature",
			"geometry":TheGeoJSONGeometry,
			"properties":TheProperties
		}
		
		TheFeatures.push(TheFeature);
	}
	var Result={
		  "type": "FeatureCollection",
 		 "features": TheFeatures
	};
	
	return(Result);
}
 
//CanvasMap/js/CMDatasetRaster.js
/******************************************************************************************************************
* CMDatasetRaster
* Manages a raster that is represnted by a JSON object.  This allows
* for any type (N-Band, RGB, etc.) and any data type (INT32, FLOAT 32)
* rasters to be managed in the client.d
*
* The drawing functions maps the raster to the screen based on
* the overall min max values.
*
* @module CMDatasetRaster
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMDatasetRaster() 
{
	CMDataset.call(this);

	// properties
	this.TheMatrix=null; // data for the raster
}
CMDatasetRaster.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetRaster.prototype.contructor=CMDatasetRaster; // override the constructor to go to ours
//******************************************************************
// CMLayer Class
//******************************************************************
/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMDatasetRaster.prototype.SetURL=function(URL) 
{
	if (this.URL!=URL)
	{
	
		this.URL=URL;
		
		var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
		TheRequest.open("GET",URL,true); // the URL is what we ordered
		TheRequest.TheURL=URL;
		TheRequest.TheDataset=this;
		//TheRequest.ZoomToBounds=ZoomToBounds;
				
		TheRequest.onreadystatechange=function() 
		{
			if (this.readyState == 4)  // done
			{
				if (this.status == 200) // OK
				{
					var TheText=TheRequest.responseText;
	
					var TheGeoJSONObject=JSON.parse(TheText);
					
					this.TheDataset.SetData(TheGeoJSONObject); // sends MESSAGE_DATASET_LOADED message
					
					//this.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_DATASET_LOADED);
					
					// repaint last so the layer has the chance to chagne the painting settings (listeners made this obsolete)
				}
				else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
			}
		}
		TheRequest.send();
	}
}
/*
* Set the data for this dataset.  Called by SetURL() and by CMLayerPyramid for
* raster data that is embedded in a tile.
*/
CMDatasetRaster.prototype.CMDataset_SetData=CMDataset.prototype.SetData;

CMDatasetRaster.prototype.SetData=function(TheData) 
{
	this.CMDataset_SetData(TheData);
	
	this.TheGeoJSONObject=TheData;
	this.NumBands=TheData.NumBands;
	this.WidthInPixels=TheData.WidthInPixels;
	this.HeightInPixels=TheData.HeightInPixels;
	this.NumBands=TheData.NumBands;
	this.MinPixelValues=TheData.MinPixelValues;
	this.MaxPixelValues=TheData.MaxPixelValues;
	
	this.SetBounds(TheData.Bounds);
	
	this.TheMatrix=TheData.Data;
	
	this.SendMessageToListeners(CMDataset.MESSAGE_DATASET_LOADED);
}

//******************************************************************
// CMDatasetRaster Functions
//******************************************************************
/**
* SetBounds must be called before SetImage or SetURL are called so the raster can be 
*/

CMDatasetRaster.prototype.SetImage=function(TheImage) 
{
	this.TheImage=TheImage;
}

CMDatasetRaster.prototype.In=function(TheView,RefX,RefY,RefTolerance) 
{
	return(-1);
};

//***************************************************************************
// reference functions
//*************************************************************************
/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Bounds with format {XMin,XMax,YMin,YMax}
*/
CMDatasetRaster.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMDatasetRaster.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}
//***************************************************************************
// reference functions
//*************************************************************************
CMDatasetRaster.prototype.GetRefY=function() 
{
	return(this.TheBounds.YMax);
}
CMDatasetRaster.prototype.GetRefX=function() 
{
	return(this.TheBounds.XMin);
}
CMDatasetRaster.prototype.GetRefWidth=function() 
{
	return(this.TheBounds.XMax-this.TheBounds.XMin);
}
CMDatasetRaster.prototype.GetRefHeight=function() 
{
	return(this.TheBounds.YMin-this.TheBounds.YMax);
}
//***************************************************************************
// reference functions
//*************************************************************************
CMDatasetRaster.prototype.GetPixelRefWidth=function()
{
	var Result=1;
	if (this.GetBounds()!=null) Result=this.GetRefWidth()/this.WidthInPixels;
	return(Result);
}
CMDatasetRaster.prototype.GetPixelRefHeight=function()
{
	var Result=-1;
	if (this.GetBounds()!=null) Result=this.GetRefHeight()/this.HeightInPixels;
	return(Result);
}

/**
 * Returns the horizontal pixel location of a horizontal reference value.
 * @param RefX - the horizontal reference value
 * @return - the horizontal pixel location in the raster
 */
CMDatasetRaster.prototype.GetPixelXFromRefX=function(RefX)
{
	var RefInRaster=RefX-this.GetRefX();
	
	var PixelX=(RefInRaster/this.GetRefWidth())*(this.WidthInPixels);
	
	// we subtract one half of a pixel width to move the reference from the left
	// of the left-most pixel to the center of the pixel.
//	var PixelX=(((RefInRaster-(this.GetPixelRefWidth()/2))/this.GetRefWidth())*this.WidthInPixels);

	return(PixelX);
}
CMDatasetRaster.prototype.GetPixelXFromRefX2=function(RefX)
{
	var RefInRaster=RefX-this.GetRefX();
	
	var PixelX=(RefInRaster/this.GetRefWidth())*(this.WidthInPixels-1);
	
	// we subtract one half of a pixel width to move the reference from the left
	// of the left-most pixel to the center of the pixel.
//	var PixelX=(((RefInRaster-(this.GetPixelRefWidth()/2))/this.GetRefWidth())*this.WidthInPixels);

	return(PixelX);
}
/**
 * Returns the vertical pixel location of a vertical reference value.
 * @param RefY - the vertical reference value
 * @return - the vertical pixel location in the raster
 */
CMDatasetRaster.prototype.GetPixelYFromRefY=function(RefY)
{
	var RefInRaster=RefY-this.GetRefY();

	var PixelY=(RefInRaster/this.GetRefHeight())*(this.HeightInPixels);

//	var PixelY=(((RefInRaster-(this.GetPixelRefHeight()/2))/this.GetRefHeight())*this.HeightInPixels);

	return(PixelY);
}
CMDatasetRaster.prototype.GetPixelYFromRefY2=function(RefY)
{
	var RefInRaster=RefY-this.GetRefY();

	var PixelY=(RefInRaster/this.GetRefHeight())*(this.HeightInPixels-1);

//	var PixelY=(((RefInRaster-(this.GetPixelRefHeight()/2))/this.GetRefHeight())*this.HeightInPixels);

	return(PixelY);
}
/**
 * Gets the specified reference width (map units) to a width in pixels.
 * @param RefWidth
 * @return
 */
CMDatasetRaster.prototype.GetPixelWidthFromRefWidth=function(RefWidth)
{
	var PixelWidth=((RefWidth/this.GetRefWidth())*this.WidthInPixels);

	return(PixelWidth);
}
/**
 * Gets the specified reference height (map units) to a height in pixels.
 * @param RefHeight
 * @return
 */
CMDatasetRaster.prototype.GetPixelHeightFromRefHeight=function(RefHeight)
{
	var PixelHeight=((RefHeight/this.GetRefHeight())*this.HeightInPixels);

	return(PixelHeight);
}
/**
 * Gets a x reference value (map units) from a x pixel locatoin in this raster.
 * @param PixelX
 * @return
 */
CMDatasetRaster.prototype.GetRefXFromPixelX=function(PixelX)
{
	var RefInRaster=(PixelX/this.WidthInPixels)*this.GetRefWidth();//+(this.GetPixelRefWidth()/2);
	
	var RefX=RefInRaster+this.GetRefX();

	return(RefX);
}
CMDatasetRaster.prototype.GetRefXFromPixelX2=function(PixelX)
{
	var RefInRaster=(PixelX/(this.WidthInPixels-1))*this.GetRefWidth();//+(this.GetPixelRefWidth()/2);
	
	var RefX=RefInRaster+this.GetRefX();

	return(RefX);
}
/**
 * Gets a y reference value (map units) from a y pixel locatoin in this raster.
 * @param PixelY
 * @return
 */
CMDatasetRaster.prototype.GetRefYFromPixelY=function(PixelY)
{
	var RefInRaster=(PixelY/this.HeightInPixels)*this.GetRefHeight();//+(this.GetPixelRefHeight()/2);
	
	var RefY=RefInRaster+this.GetRefY();

	return(RefY);
}
CMDatasetRaster.prototype.GetRefYFromPixelY2=function(PixelY)
{
	var RefInRaster=(PixelY/(this.HeightInPixels-1))*this.GetRefHeight();//+(this.GetPixelRefHeight()/2);
	
	var RefY=RefInRaster+this.GetRefY();

	return(RefY);
}
/**
 * Converts a width in pixels to a a width in reference units (map units)
 * @param PixelWidth 
 * @return
 */
CMDatasetRaster.prototype.GetRefWidthFromPixelWidth=function(PixelWidth)
{
	var RefWidth=(PixelWidth/this.WidthInPixels)*this.GetRefWidth();

	return(RefWidth);
}
/**
 * Converts a height in pixels to a height in reference units (map units)
 * @param PixelHeight
 * @return
 */
CMDatasetRaster.prototype.GetRefHeightFromPixelHeight=function(PixelHeight)
{
	var RefHeight=(PixelHeight/this.HeightInPixels)*this.GetRefHeight();

	return(RefHeight);
}
//***************************************************************************
// Painting functions
//*************************************************************************

/*
* Paints a layer into the canvas
*/
CMDatasetRaster.prototype.Paint=function(TheView) 
{
	var TheImageData=null;
	
	if ((this.TheMatrix!=null))
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		var TheImageBounds=this.GetBounds();
		
	/*	var ImageRefX=TheImageBounds.XMin;
		var ImageRefY=TheImageBounds.YMax;
		var ImageRefWidth=TheImageBounds.XMax-TheImageBounds.XMin;
		var ImageRefHeight=TheImageBounds.YMin-TheImageBounds.YMax;
		
		// find the area of overlap between the view and the raster
		
		var TheViewBounds=TheView.GetBounds();
		
		var RefLeft=TheViewBounds.MinX-ImageMinX;
		var RefRight=TheViewBounds.MaxX-ImageMaxX;
		
		var Result=this.GetPixelFromRef(RefX,RefY);
		var XInPixels1=Math.round(Result.PixelX);
		var YInPixels1=Math.round(Result.PixelY);
		
		var PixelWidth=this.GetPixelWidthFromRefWidth(RefWidth);
		var PixelHeight=this.GetPixelHeightFromRefHeight(RefHeight);
		
		PixelWidth=Math.round(PixelWidth);
		PixelHeight=Math.round(PixelHeight);
*/	
		// get the raster bounds
		var RasterBounds=this.GetBounds();
		
		var XMin=RasterBounds.XMin;
		var XMax=RasterBounds.XMax;
		var YMin=RasterBounds.YMin;
		var YMax=RasterBounds.YMax;
		
		// assume we are drawing the entire raster
		var RasterPixelX=0;
		var RasterPixelY=0;
		
		var RasterRefWidth=RasterBounds.XMax-RasterBounds.XMin; 
		var RasterRefHeight=RasterBounds.YMin-RasterBounds.YMax; // ref height is negative
		
		// setup the image data to match the raster exactly
		var ImageDataHeightInPixels=this.HeightInPixels;
		var ImageDataWidthInPixels=this.WidthInPixels;
		
		//***************************************************************
		// find the location of the raster in the view (upper left pixel)
		var ViewBounds=TheView.GetBounds();
		
		// assume we are drawing from the upper left corner of the raster
		var ViewPixelX=TheView.GetPixelXFromRefX(XMin);
		var ViewPixelY=TheView.GetPixelYFromRefY(YMax);
		
		if (XMin<ViewBounds.XMin) // raster is off the left of the view
		{
			XMin=ViewBounds.XMin;
			ViewPixelX=0;
			RasterPixelX=this.GetPixelXFromRefX(XMin);
		}
		if (YMax>ViewBounds.YMax) // raster is off the top of the view
		{
			YMax=ViewBounds.YMax;
			ViewPixelY=0;
			RasterPixelY=this.GetPixelYFromRefY(YMax);
		}
		if (ViewBounds.XMax<XMax) // raster is off the right of the view
		{
			XMax=ViewBounds.XMax;
		}
		if (ViewBounds.YMin>YMin) // raster is off the bottom of the view
		{
			YMin=ViewBounds.YMin;
		}
		// find the ref width for the area that is common to the raster and the view
		var RefWidth=XMax-XMin;
		var RefHeight=YMin-YMax;
		
		// find the dimensions for the raster
		var RasterDataWidthInPixels=this.GetPixelWidthFromRefWidth(RefWidth);
		var RasterDataHeightInPixels=this.GetPixelHeightFromRefHeight(RefHeight);
		
		var ImageDataWidthInPixels=TheView.GetPixelWidthFromRefWidth(RefWidth);
		var ImageDataHeightInPixels=TheView.GetPixelHeightFromRefHeight(RefHeight);
		
		var SampleRateX=RasterDataWidthInPixels/ImageDataWidthInPixels;
		var SampleRateY=RasterDataHeightInPixels/ImageDataHeightInPixels;
		
		// make sure all hte values are intgers
		
		RasterPixelX=Math.round(RasterPixelX);
		RasterPixelY=Math.round(RasterPixelY);
		
		ImageDataHeightInPixels=Math.round(ImageDataHeightInPixels);
		ImageDataWidthInPixels=Math.round(ImageDataWidthInPixels);
		
		if ((ImageDataWidthInPixels>0)&&(ImageDataHeightInPixels>0))
		{
			// get the original data from the canvas
			TheImageData=TheContext.getImageData(ViewPixelX,ViewPixelY,ImageDataWidthInPixels,ImageDataHeightInPixels);
			
			//TheImageData=TheContext.createImageData(this.WidthInPixels,this.HeightInPixels);
			
			var Factor=256/(this.MaxPixelValues-this.MinPixelValues);
			
			var TheMask=this.TheGeoJSONObject.Mask;
			
			var ImageIndex=0;
			for (var y=0;y<ImageDataHeightInPixels;y++)
			{
				var RasterY=RasterPixelY+y*SampleRateY;
				RasterY=Math.round(RasterY);
				
				if (RasterY<0) RasterY=0;
				if (RasterY>=this.HeightInPixels) RasterY=this.HeightInPixels-1;
				
				for (var x=0;x<ImageDataWidthInPixels;x++)
				{
					var RasterX=RasterPixelX+x*SampleRateX;
					RasterX=Math.round(RasterX);
						
					if (RasterX<0) RasterX=0;
					if (RasterX>=this.WidthInPixels) RasterX=this.WidthInPixels-1;
				
					// setup the mask value
					var MaskValue=255;
					
					if (TheMask!=null) 
					{
						try
						{
							MaskValue=TheMask[RasterY][RasterX];
						}
						catch (error)
						{
							throw(error);
						}
					}
					// if not transparent, just copy the pixel values into the canvas
					if (MaskValue!=0)
					{
						var Value=this.TheGeoJSONObject.Data[RasterY][RasterX];
						
						// scale the value to go from 0 to 255
						Value=(Value-this.MinPixelValues)*Factor;
						
						Value=Math.round(Value);
						
						if (Value<0) Value=0;
						if (Value>255) Value=255;
					
						// if there is no mask, replace the pixels in the view with the raster pixel
						if (MaskValue==255)
						{
							TheImageData.data[ImageIndex+0]=Value;
							TheImageData.data[ImageIndex+1]=Value;
							TheImageData.data[ImageIndex+2]=Value;
						}
						else // there is some transparency
						{
							var Red=TheImageData.data[ImageIndex+0];
							var Green=TheImageData.data[ImageIndex+1];
							var Blue=TheImageData.data[ImageIndex+2];
							
							Red=(Red/255.0*(255-MaskValue))+(Value/255.0*MaskValue);
							if (Red<0) Red=0;
							if (Red>255) Red=255;
							
							Green=(Green/255.0*(255-MaskValue))+(Value/255.0*MaskValue);
							if (Green<0) Green=0;
							if (Green>255) Green=255;
							
							Blue=(Blue/255.0*(255-MaskValue))+(Value/255.0*MaskValue);
							if (Blue<0) Blue=0;
							if (Blue>255) Blue=255;
					
							
							TheImageData.data[ImageIndex+0]=Math.round(Red);
							TheImageData.data[ImageIndex+1]=Math.round(Green);
							TheImageData.data[ImageIndex+2]=Math.round(Blue);
							
							// don't change the transparency as this is the transparency for the canvas element!
							//TheImageData.data[ImageIndex+3]=MaskValue; 
						}
					}
					ImageIndex+=4;
				}
			}
			if (TheImageData!=null)
			{
				//TheContext.clearRect(ViewPixelX,ViewPixelY, TheImageData.width, TheImageData.height);
				
				TheContext.putImageData(TheImageData,ViewPixelX,ViewPixelY);
			}
		}
		return(TheImageData);
	}
}
//***************************************************************************
// Public CMDatasetRaster functions
//*************************************************************************

/*
* Returns the value of a single pixel. 
* Used when raster has coordinates in the middle of thepixel - jjg when not used as a DEM
* @public
*/
CMDatasetRaster.prototype.GetSampleFromRef=function(RefX,RefY,Band) 
{
	var Result=undefined;
	
	if (this.TheGeoJSONObject!=undefined)
	{
		if (Band==undefined) Band=0;
		
		var RasterBounds=this.GetBounds();
		
		var PixelRefWidth=this.GetRefWidth()/this.WidthInPixels;
		var PixelRefHeight=this.GetRefHeight()/this.HeightInPixels;
		
		var PixelX=Math.floor(this.GetPixelXFromRefX(RefX));
		var PixelY=Math.floor(this.GetPixelYFromRefY(RefY));
		
		// bilinear interpolation 
		if ((PixelX>=0)&&(PixelX<this.WidthInPixels)&&(PixelY>=0)&&(PixelY<this.HeightInPixels))
		{
			if (((PixelX+1)<this.WidthInPixels)&&((PixelY+1)<this.HeightInPixels))
			{
				var PixelRefX=(this.GetRefXFromPixelX(PixelX));
				var PixelRefY=(this.GetRefYFromPixelY(PixelY));
				
				var XRemainder=(PixelRefX-RefX)/this.WidthInPixels;
				var YRemainder=(PixelRefY-RefY)/this.HeightInPixels;
				
				var Pixel11=this.TheGeoJSONObject.Data[PixelY][PixelX];
				var Pixel12=this.TheGeoJSONObject.Data[PixelY+1][PixelX];
				var Pixel21=this.TheGeoJSONObject.Data[PixelY][PixelX+1];
				var Pixel22=this.TheGeoJSONObject.Data[PixelY+1][PixelX+1];
				
				var X1=Pixel11*(1-XRemainder)+Pixel21*XRemainder;
				var X2=Pixel12*(1-XRemainder)+Pixel22*XRemainder;
				
				Result=X1*(1-YRemainder)+X2*YRemainder;
			}
			else
			{
				Result=this.TheGeoJSONObject.Data[PixelY][PixelX];
			}
		}
	}
	return(Result);
}
/*
* Returns the value of a single pixel.  
* @public
*/
CMDatasetRaster.prototype.GetSampleFromRef_PixelsInCorners=function(RefX,RefY) 
{
	var Result=undefined;
	
	if (this.TheGeoJSONObject!=undefined)
	{
		var RasterBounds=this.GetBounds();
		
		var PixelRefWidth=this.GetRefWidth()/(this.WidthInPixels-1);
		var PixelRefHeight=this.GetRefHeight()/(this.HeightInPixels-1);
		
		var PixelX=(this.GetPixelXFromRefX2(RefX));
		var PixelY=(this.GetPixelYFromRefY2(RefY));
		
		PixelX=Math.floor(PixelX);
//		else PixelX=Math.ceil(PixelX);
		
		PixelY=Math.floor(PixelY); // these are reversed because the pixels are in the opposite direction as the ref coordinates
//		else PixelY=Math.ceil(PixelY);
		
		var TheData=this.TheGeoJSONObject.Data;
		
		// bilinear interpolation 
		if ((PixelX>=-0)&&(PixelX<this.WidthInPixels)&&(PixelY>=-0)&&(PixelY<this.HeightInPixels)) // valid pixel
		{
			// only can do bilinear interpolation if the pixels are available in the x and y directions
			if (((PixelX+1)<this.WidthInPixels)&&((PixelY+1)<this.HeightInPixels)) // full bilinear interpolation
			{
				var PixelRefX=(this.GetRefXFromPixelX2(PixelX));
				var PixelRefY=(this.GetRefYFromPixelY2(PixelY));
				
				var XRemainder=(PixelRefX-RefX)/PixelRefWidth;
				var YRemainder=(PixelRefY-RefY)/PixelRefHeight;
				
				if (true)
				{
					XRemainder=Math.abs(XRemainder);
					YRemainder=Math.abs(YRemainder);
					
					var Pixel11=TheData[PixelY][PixelX];
					var Pixel12=TheData[PixelY+1][PixelX];
					var Pixel21=TheData[PixelY][PixelX+1];
					var Pixel22=TheData[PixelY+1][PixelX+1];
					
					var X1=Pixel11*(1-XRemainder)+Pixel21*XRemainder;
					var X2=Pixel12*(1-XRemainder)+Pixel22*XRemainder;
					
					Result=X1*(1-YRemainder)+X2*YRemainder;
				}
			}
			else if ((PixelX+1)<this.WidthInPixels) // interpolate along the x axis
			{
				var PixelRefX=(this.GetRefXFromPixelX2(PixelX));
				
				var XRemainder=(PixelRefX-RefX)/PixelRefWidth;
				
				XRemainder=Math.abs(XRemainder);
				
				var Pixel11=TheData[PixelY][PixelX];
				var Pixel21=TheData[PixelY][PixelX+1];
				
				Result=Pixel11*(1-XRemainder)+Pixel21*XRemainder;
			}
			else if ((PixelY+1)<this.HeightInPixels) // interpolate along the y axis
			{
				var PixelRefX=(this.GetRefXFromPixelX2(PixelX));
				var PixelRefY=(this.GetRefYFromPixelY2(PixelY));
				
				var YRemainder=(PixelRefY-RefY)/PixelRefHeight;
				
				YRemainder=Math.abs(YRemainder);
				
				var Pixel11=TheData[PixelY][PixelX];
				var Pixel12=TheData[PixelY+1][PixelX];
				
				Result=Pixel11*(1-YRemainder)+Pixel12*YRemainder;
			}
			else // no interpolation as we are in the corner
			{
				Result=TheData[PixelY][PixelX];
			}
		}
	}
	return(Result);
}
/**
* returns an array of THREE.Vector3 objects with the z values set from the 
* associated DEM.  New points will be added to the array when the line segments
* cross a vertical or horizontal boundary between pixels.
* 
* @public
*/
CMDatasetRaster.prototype.GetPathArray=function(Xs,Ys,Zs,ZOffset,ZMultiplier) 
{
	if (ZOffset==undefined) ZOffset=0;
	if (ZMultiplier==undefined) ZMultiplier=1;
	
	var PathArray=[];
	
	if (this.TheMatrix==undefined)
	{
		for (var j=0;j<Xs.length;j++)
		{
			var RefX=Xs[j];
			var RefY=Ys[j];
			var RefZ=0;
			
			if (Zs!=null) // get the z value from the points
			{
				RefZ=Zs[j];
			}
			else // see if there is a DEM for a z value
			{
				var DEM_ZOffset=this.GetSampleFromRef(RefX,RefY);
				
				if (DEM_ZOffset!=undefined) RefZ=DEM_ZOffset;
			}
			// apply the mulitplier and offset
			RefZ=RefZ*ZMultiplier+ZOffset;
			
			PathArray.push(new THREE.Vector3(RefX,RefY,RefZ));
		}
	}
	else if (Xs.length>1)
	{
		// new approach to find coordinates at each break between the cells of the raster
		var TheData=this.TheMatrix;
		var NumRows=this.TheMatrix.length;
		var NumCols=this.TheMatrix[0].length;
		var TheBounds=this.TheBounds;
		
		this.PixelWidth=(this.TheBounds.XMax-this.TheBounds.XMin)/(this.WidthInPixels-1);///TheData.length;
		this.PixelHeight=(this.TheBounds.YMax-this.TheBounds.YMin)/(this.HeightInPixels-1);///TheData[0].length;
		
		if ((false)&&(typeof(TheMainContainer)!="undefined"))
		{
			var TheScene=TheMainContainer.GetScene();
			for (var Row=0;Row<this.TheMatrix.length;Row++)
			{
				var RefY=(Row*this.PixelHeight)+this.TheBounds.YMin;
				
				for (var Col=0;Col<TheData[0].length;Col++)
				{
					var RefX=(Col*this.PixelWidth)+this.TheBounds.XMin;
					
					var Z=this.TheMatrix[NumRows-Row-1][Col];
					
					Z*=ZMultiplier;
					
					TheScene.AddSphere(RefX,RefY, Z,1,"rgb(0,0,0)");
				}
			}
		}
		
		// setup the first coordinate which is always at the start of the polyline
		var StartRefX=Xs[0];
		var StartRefY=Ys[0];
		
		//*********************************************************************
		// add the first coordinate in the polyline to the path array
	
		// setup the coordinate's z value
		this.AddPointToPathArray(StartRefX,StartRefY,Zs,PathArray,ZOffset,ZMultiplier);
		
		// variables to track the previously added point to check for crossing
		// the diagonal within a cell
		var LastAddedRefX=StartRefX;
		var LastAddedRefY=StartRefY;
		
		//*********************************************************************
		// go through each pair of coordinates in the array
		for (var j=1;j<Xs.length;j++)
		{
			var EndRefX=Xs[j];
			var EndRefY=Ys[j];
			
			// skip any coordinates that are the same as the previous coordinate
			if ((EndRefX!=StartRefX)||(EndRefY!=StartRefY))
			{
				// jjg - this if can be removed
				if ((j!=0)&&(true)) // have another coordinate
				{
					//*********************************************
					// find the equation of the line for the segment
					var Result=CMUtilities.GetLineFactors( StartRefX, StartRefY, EndRefX, EndRefY);
					var m=Result[0];
					var b=Result[1];
					
					//*********************************************
					// find which direction to move through the cells that overlap with the line segement
					var RowInc=1; // assume bottom to top
					var ColInc=1; // assume going left to right
					
					if (StartRefX<=EndRefX) // going left to right
					{
						if (StartRefY>EndRefY) RowInc=-1; // going from top left down to the right
					}
					else // going right to left
					{
						ColInc=-1;
						
						if (StartRefY>EndRefY)  RowInc=-1; // going from top right down to the left
					}
					//*********************************************
					// find the start and end row (refers to rows of pixels in the data
					
					// assume y is increasing with x
					var StartRow=(StartRefY-this.TheBounds.YMin)/this.PixelHeight;
					var EndRow=(EndRefY-this.TheBounds.YMin)/this.PixelHeight;
					
					// find the start and end rows that are on either side of the line segment so we don't miss anything
					if (RowInc<0) // y decreasing
					{
						StartRow=Math.ceil(StartRow); // start on the row just below the StartRefY
						EndRow=Math.floor(EndRow); // end on the row 
					}
					else // y increasing
					{
						StartRow=Math.floor(StartRow);
						EndRow=Math.ceil(EndRow);
					}
					// we can run one off the bottom and one above to make sure we get the columns above and below the grid
					if (StartRow<-1) StartRow=-1;
					if (EndRow<-1) EndRow=-1;
					if (StartRow>NumRows) StartRow=NumRows;
					if (EndRow>NumRows) EndRow=NumRows;
					
					// find the Ref y coordinate of the start and end rows
					var StartRowY=(StartRow*this.PixelHeight)+this.TheBounds.YMin;
					var EndRowY=(EndRow*this.PixelHeight)+this.TheBounds.YMin;
					
					// start with the start and end coordinates
					
					var RowRefLastDividerX=null;
					
					// go through each of the rows. some of which may be outside the range of the data (above and below)
					// the line at the row is checked each time through while the columns between the rows
					// are checked all but the last time
					for (var Row=StartRow;Row!=(EndRow);Row+=RowInc)  // if the start and end are the same, we still process the columns in the row
					{
						// assume we are gonig from the line segments start to end positions
						var CurrentStartX=StartRefX; // x for the last intersection with a division between two rows
						var CurrentStartY=StartRefY;
						var CurrentEndX=EndRefX;
						var CurrentEndY=EndRefY;
						
						//************************************************************
						// Find the current start and end coordinates within the current row (i.e. clip at the edges of the row)
						
						// find the refY intersections with the top and bottom of the row of cells
						var RowRefY1=this.TheBounds.YMin+((Row)*this.PixelHeight);
						var RowRefY2=this.TheBounds.YMin+((Row+RowInc)*this.PixelHeight);
						
						// find the refX intersection with the top and bottom of the row of cells
						
						var RowRefDividerX1=StartRefX;//(RowRefY1-b)/m;
						var RowRefDividerX2=StartRefX;//(RowRefY2-b)/m;
						
						if ((m!=0)&&(m!=Infinity))
						{
							RowRefDividerX1=(RowRefY1-b)/m;
							RowRefDividerX2=(RowRefY2-b)/m;
						}
						// find the starting coordinate (either the end of the segment or an intersection with the top or bottom of the row)
						if (RowInc>=0) // moving in a positive direction
						{
							if (StartRefY<RowRefY1) // starting before the row
							{
								CurrentStartX=RowRefDividerX1;
								CurrentStartY=RowRefY1;
							}
							if (EndRefY>RowRefY2) // ending after the row
							{
								CurrentEndX=RowRefDividerX2;
								CurrentEndY=RowRefY2;
							}
						}
						else // moving in a nagative direction
						{
							if (StartRefY>RowRefY1) // starting before the row
							{
								CurrentStartX=RowRefDividerX1;
								CurrentStartY=RowRefY1;
							}
							if (EndRefY<RowRefY2) // ending after the row
							{
								CurrentEndX=RowRefDividerX2;
								CurrentEndY=RowRefY2;
							}
						}
					
						//************************************************************
						// save the point at the intersection of the line segment and the line between the rows
						if ((Row>=0)&&(Row<NumRows))
						{
							// make sure the line starts above the row and ends after the row (or visa versa)
							var Draw=false;
							if (RowInc>=0) // moving in a positive direction
							{
								if ((StartRefY<RowRefY1)&&(EndRefY>RowRefY1)) Draw=true;
							}
							else
							{
								if ((StartRefY>RowRefY1)&&(EndRefY<RowRefY1)) Draw=true;
							}
							if (Draw)
							{
								if (LastAddedRefX!=null)
								{
									this.AddDiagonalCrossing(LastAddedRefX,LastAddedRefY,RowRefDividerX1,RowRefY1,Zs,PathArray,ZOffset,ZMultiplier,TheBounds);
								}
								this.AddPointToPathArray(RowRefDividerX1,RowRefY1,Zs,PathArray,ZOffset,ZMultiplier,TheBounds);
								
								LastAddedRefX=RowRefDividerX1;
								LastAddedRefY=RowRefY1;
							}
						}
						//************************************************************
						// move across the columns for all but the last rows
						var Draw=false;
						if (RowInc>=0) // moving in a positive direction (up)
						{
							if ((StartRefY<RowRefY2)&&(EndRefY>RowRefY1)) Draw=true;
								//&&(Row>StartRow)&&(Row<EndRow)) Draw=true;
						}
						else // moving in a negative direction (down)
						{
							if ((StartRefY>RowRefY2)&&(EndRefY<RowRefY1)) Draw=true;
								//&&(Row<=StartRow)&&(Row>EndRow)) Draw=true;
						}
					
						//************************************************************
						// move across the columns for all but the last rows
						if ((Draw)) //&&(Row<EndRow)
						{
							// Find the start and end columns
							var StartCol=(CurrentStartX-this.TheBounds.XMin)/this.PixelWidth;
							var EndCol=(CurrentEndX-this.TheBounds.XMin)/this.PixelWidth;
							
							if (ColInc<0) // x decreasing
							{
								StartCol=Math.floor(StartCol); // start on the Col just below the StartRefY
								EndCol=Math.ceil(EndCol); // end on the Col 
							}
							else // x increasing
							{
								StartCol=Math.ceil(StartCol);
								EndCol=Math.floor(EndCol);
							}
							// just check the valid columns
							if (StartCol<0) StartCol=0;
							if (StartCol>=NumCols) StartCol=NumCols-1;
							if (EndCol<0) EndCol=0;
							if (EndCol>=NumCols) EndCol=NumCols-1;
							
							// find the pixel location at the column
							var StartColX=(StartCol*this.PixelWidth)+this.TheBounds.XMin;
							var EndColX=(EndCol*this.PixelWidth)+this.TheBounds.XMin;
							
							// move across each column in the row
							for (var Col=StartCol;Col!=(EndCol+ColInc);Col+=ColInc) // skips if they are the same column
							{
								// find the ref of the left of the Col
								var ColRefX=this.TheBounds.XMin+(Col*this.PixelWidth);
								
								// find the intersection with the top of this Col
								var ColRefLeftIntersectionY=(ColRefX*m)+b;
								
								// add the intersection with the column
								
								var Draw=false;
								
								if (ColInc>=0)
								{
									if ((StartRefX<ColRefX)&&(EndRefX>ColRefX)) Draw=true;
								}
								else
								{
									if ((StartRefX>ColRefX)&&(EndRefX<ColRefX)) Draw=true;
								}
								// jjg - kind of a kludge for now until I get the rows and cols figured out exactly
								if ((ColRefLeftIntersectionY<TheBounds.YMin)||(ColRefLeftIntersectionY>TheBounds.YMax)) Draw=false;
								
								if (Draw) 
								{
									if (LastAddedRefX!=null)
									{
										this.AddDiagonalCrossing(LastAddedRefX,LastAddedRefY,ColRefX,ColRefLeftIntersectionY,Zs,PathArray,ZOffset,ZMultiplier,TheBounds);
									}
									this.AddPointToPathArray(ColRefX,ColRefLeftIntersectionY,Zs,PathArray,ZOffset,ZMultiplier,TheBounds);
									
									LastAddedRefX=ColRefX;
									LastAddedRefY=ColRefLeftIntersectionY;
								}
							}
						}
					}
				}
				//*********************************************************************
				// add the next coordinate in the polyline to the path array
				
				// setup the coordinate's z value
				this.AddPointToPathArray(EndRefX,EndRefY,Zs,PathArray,ZOffset,ZMultiplier);
				
				LastAddedRefX=EndRefX;
				LastAddedRefY=EndRefY;
				
				StartRefX=EndRefX;
				StartRefY=EndRefY;
			}
		}
	}
	return(PathArray);
}
/**
* Add a point to the path array.  Used by GetPathArray() to add the points that are inside
* and outside the grid
* @private
* TheBounds - bounds to clilp bounds, undefined if the point should be added regardless of where it is
*/
CMDatasetRaster.prototype.AddPointToPathArray=function(RefX,RefY,Zs,PathArray,ZOffset,ZMultiplier,TheBounds) 
{
	var AddPoint=true;
	
	if (TheBounds!=undefined)
	{
		if ((RefX<TheBounds.XMin)&&(RefX>TheBounds.XMax)&&
			(RefY<TheBounds.YMin)&&(RefY>TheBounds.YMax))
		{
			AddPoint=false;
		}
	}
	if (AddPoint)
	{
		var RefZ=0;
		if (Zs!=null) RefZ=Zs[j];
		else 
		{
			RefZ=this.GetSampleFromRef_PixelsInCorners(RefX,RefY);
			if (RefZ==undefined) RefZ=0;
		}
		RefZ=RefZ*ZMultiplier+ZOffset;
		PathArray.push(new THREE.Vector3(RefX,RefY,RefZ));
		
		if ((false)&&(typeof(TheMainContainer)!="undefined"))
		{
			var TheScene=TheMainContainer.GetScene();
			TheScene.AddSphere(RefX,RefY, RefZ,1,"rgb(0,0,255)");
		}
	}
}
/**
* Adds a diagonal crossing if the two coordinates are in the same cell of the grid and are on opposite sides of a
* diagonal line that splits the pixel from top right to bottom left.  This function is used to add coordinates
* when line segements cross the diagonal line that seprates the two faces of a pixel in a DEM.
* @private
*/
CMDatasetRaster.prototype.AddDiagonalCrossing=function(LastAddedRefX,LastAddedRefY,NewAddedRefX,NewAddedRefY,Zs,PathArray,ZOffset,ZMultiplier,TheBounds)
{
	var LastAddedCol=Math.floor((LastAddedRefX-this.TheBounds.XMin)/this.PixelWidth);
	var LastAddedRow=Math.floor((LastAddedRefY-this.TheBounds.YMin)/this.PixelHeight);
	
	var NewAddedCol=Math.floor((NewAddedRefX-this.TheBounds.XMin)/this.PixelWidth);
	var NewAddedRow=Math.floor((NewAddedRefY-this.TheBounds.YMin)/this.PixelHeight);
	
	if ((LastAddedCol==NewAddedCol)&&(LastAddedRow==NewAddedRow))
	{
		if ((LastAddedCol>=0)&&(LastAddedCol<this.WidthInPixels)&&(LastAddedRow>=0)&&(LastAddedRow<this.HeightInPixels))
		{
			var CornerRefX=this.TheBounds.XMin+(LastAddedCol*this.PixelWidth);
			var CornerRefY=this.TheBounds.YMin+(LastAddedRow*this.PixelHeight);
			
			var LastAddedRemainderX=LastAddedRefX-CornerRefX;
			var LastAddedRemainderY=LastAddedRefY-CornerRefY;
		
			var NewAddedRemainderX=NewAddedRefX-CornerRefX;
			var NewAddedRemainderY=NewAddedRefY-CornerRefY;
		
			if (((LastAddedRemainderX>LastAddedRemainderY)&&(NewAddedRemainderX<NewAddedRemainderY))||
				((LastAddedRemainderX<LastAddedRemainderY)&&(NewAddedRemainderX>NewAddedRemainderY)))
			{
/*				var Result=CMUtilities.GetLineFactors( NewAddedRemainderX, NewAddedRemainderY, LastAddedRemainderX, LastAddedRemainderY);
				var m=Result[0];
				var b=Result[1];
	
				var Ref=b*(1-m);
*/

				var x1=0;
				var y1=0;
				var x2=this.PixelWidth;
				var y2=this.PixelHeight;
				
				var x3=LastAddedRemainderX;
				var y3=LastAddedRemainderY;
				var x4=NewAddedRemainderX;
				var y4=NewAddedRemainderY;
				
				var Result=CMUtilities.IntersectionOfTwoLineSegments(x1,y1,x2,y2,x3,y3,x4,y4);
				var RefX=Result[0];
				var RefY=Result[1];
				
				this.AddPointToPathArray(CornerRefX+RefX,CornerRefY+RefY,Zs,PathArray,ZOffset,ZMultiplier,TheBounds);
			}
		}
	}
}

//CanvasMap/js/CMDatasetPyramid.js
/*******************************************************************
* CMDatasetPyramid Class
* Represnts a pyramid of raster tiles. 
*
* member Variables:
*  NumRows - undefined if there are no tiles
* 
* @module CMDatasetPyramid
* @Copyright HSU, Jim Graham, 2019
******************************************************************/
//******************************************************************
// CMDatasetPyramid Class
//
// Represnts a pyramid of raster tiles. 
//
// member Variables:
//  NumRows - undefined if there are no tiles
//
//******************************************************************
//******************************************************************
// Global Variables
//******************************************************************
/**
* Types of data sets
* @protected
*/
CMDatasetPyramid.MESSAGE_DATASET_TILE_LOADED=CMBase.GetUniqueNumber(); // includes TheTile in the parameters

//******************************************************************
// CMDatasetPyramid Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMDatasetPyramid() 
{
	CMDataset.call(this);

	// properties
	this.AttributeInfo=null; // Attribute table for pyramid data
	this.HeadingIndex=-1; // index into the headings array (found from HTMLAttribute in parent);
	
	this.TileWidthInPixels=256;
	
	this.PaintDebugTileInfo=false; // could be a setting
	this.DebugZoomLevel=-1;
	this.DebugGlobalColumn=0;
	this.DebugGlobalRow=0;
	
	this.Bounds=null; // bounds for the entire pyramid
}
CMDatasetPyramid.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetPyramid.prototype.contructor=CMDatasetPyramid; // override the constructor to go to ours

//******************************************************************
// Functions used by subclasses and not overriden
//*****************************************************************
CMDatasetPyramid.prototype.SetDebugTile=function(ZoomLevel,GlobalColumn,GlobalRow) 
{
	this.PaintDebugTileInfo=true;
	this.DebugZoomLevel=ZoomLevel;
	this.DebugGlobalColumn=GlobalColumn;
	this.DebugGlobalRow=GlobalRow;
}

/*
* Called to obtain the data for the layer from a URL.
* @protected
* @param URL - null to reset the tiles and display nothing
*/
CMDatasetPyramid.prototype.SetURL=function(URL) 
{
	if (this.URL!=URL)
	{
		this.URL=URL;
		
		if (URL==null)
		{
			this.Tiles=undefined;
			this.NumRows=undefined;
			this.NumColumns=undefined;
		}
		else
		{
			var URL=this.URL+"Info.js";
		
			var TheRequest=new XMLHttpRequest();
			
			TheRequest.open("GET",URL,true);
			TheRequest.TheURL=URL;
			TheRequest.TheDataset=this;
					
			TheRequest.onreadystatechange=function() 
			{
				if( this.readyState == 4)  // done
				{
					if( this.status == 200) // OK
					{
						var TheText=this.responseText;
		
						var TheInfo=JSON.parse(TheText);
						
						//*******************
						
						if (this.TheDataset.GetName()===null) this.TheDataset.SetSetting("Item","Name",TheInfo.Title);
						
						var TheBounds = TheInfo.Bounds;
						this.TheDataset.SetBounds(TheBounds);
						
						this.TheDataset.OriginalBounds=TheInfo.OriginalBounds;
						
						this.TheDataset.TileRefWidth=TheInfo.TileRefWidth;
						this.TheDataset.MinColumn=Math.round(TheInfo.MinColumn) ;
						this.TheDataset.MaxColumn=Math.round(TheInfo.MaxColumn) ;
						this.TheDataset.NumColumns=Math.round(TheInfo.NumColumns) ;
						this.TheDataset.MinRow=Math.round(TheInfo.MinRow) ;
						this.TheDataset.MaxRow=Math.round(TheInfo.MaxRow) ;
						this.TheDataset.NumRows=Math.round(TheInfo.NumRows) ;
					
						this.TheDataset.Type=TheInfo.Type;
						
						this.TheDataset.TopZoomLevel=Math.round(TheInfo.TopZoomLevel) ;
						
						if ((this.TheDataset.Type=="REGIONS")||(this.TheDataset.Type=="POINTS"))
						{
							this.TheDataset.AttributeInfo=TheInfo.AttributeInfo;
							//this.LoadAttributeInfo(this.TheURL);
						}
						if (this.TheDataset.Type=="RASTER_DATA")
						{
							this.TheDataset.MinPixelValues=TheInfo.MinPixelValues;
							this.TheDataset.MaxPixelValues=TheInfo.MaxPixelValues;
						}
						
						//*************************************************************************
						// load the first step of child tiles
						
						this.TheDataset.Tiles=[];
					
						var TheMainContainer=this.TheDataset.GetParent(CMMainContainer);
						
	//					var TheView=TheMainContainer.GetScene().GetView(0); // jjg= fix later
						
						for (Row=0;Row<this.TheDataset.NumRows;Row++)
						{
							this.TheDataset.Tiles[Row]=[];
								
							for (Column=0;Column<this.TheDataset.NumColumns;Column++)
							{
								var GlobalRow=this.TheDataset.MaxRow-Row;
								var GlobalColumn=Column+this.TheDataset.MinColumn;
								var ZoomLevel=this.TheDataset.TopZoomLevel;
								
								this.TheDataset.Tiles[Row][Column]=new CMTile(this.TheDataset,ZoomLevel,GlobalColumn,GlobalRow);
								
								if (this.PaintDebugTileInfo) TheChildTile.SetPaintTileInfo(this.PaintDebugTile);
								
								this.TheDataset.Tiles[Row][Column].LoadTile();
							}
						}
						this.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_DATASET_LOADED);
					}
					else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
				}
			}
			TheRequest.send();
		}
	}
}
CMDatasetPyramid.prototype.CMDataset_GetIcon=CMDataset.prototype.GetIcon;


CMDatasetPyramid.prototype.GetIcon=function(TheLayer,Default)
{
	var TheIcon=this.CMDataset_GetIcon(TheLayer,Default);
	
//	if ((this.TheRegions!=null)) //
	{
		switch (this.Type)
		{
		case "REGIONS":
			{
				TheIcon=document.createElement('CANVAS');
				TheIcon.className="CM_LayerListIconClass";
				TheIcon.TheLayer=this;
				TheIcon.style.borderColor="rgba(0,0,0,0)";
				
				TheIcon.width=16;
				TheIcon.height=16;
				
				var TheView=new CMView2D();
				TheView.Setup(TheIcon);
					
				var StrokeStyle=TheLayer.GetSetting("Style","strokeStyle");
				var LineWidth=TheLayer.GetSetting("Style","lineWidth");
	
				var TheContext = TheIcon.getContext("2d");
				TheContext.strokeStyle=StrokeStyle;
				TheContext.lineWidth=LineWidth;
				
				TheContext.moveTo(0,0);
				TheContext.lineTo(16,16);
				TheContext.moveTo(0,16);
				TheContext.lineTo(7,7);
				TheContext.stroke();
			}
			break;
		case "POINTS":
			{
				var TheType=TheLayer.GetSetting("Mark","Type",undefined);
		
				if (TheType==undefined) TheType=CMLayer.MARK_CIRCLE;
				
				var StrokeStyle=TheLayer.GetSetting("Style","strokeStyle");
				var FillStyle=TheLayer.GetSetting("Style","fillStyle");
				
				TheIcon=TheLayer.GetMarkIcon(TheType,FillStyle,StrokeStyle);
			}
			break;
		}
	}
	return(TheIcon);
}
//******************************************************************
// Mouse event handling
//******************************************************************
CMDatasetPyramid.prototype.GetNumFeatures=function() 
{
	var Result=0;
	
	if (this.AttributeInfo!=null) // have vector data
	{
		Result=this.AttributeInfo.NumRows;
	}
	return(Result);
}
CMDatasetPyramid.prototype.InFeature=function(TheView,RefX,RefY,TargetFeatureIndex,RefTolerance) 
{
	var Result=false;
	
//	if (this.GetVisible())//&&(this.TheData!=null))
	{
		for (var Row=0;(Row<this.NumRows)&&(Result==false);Row++)
		{
			for (Column=0;(Column<this.NumColumns)&&(Result===false);Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				var FeatureIndex=TheTile.In(TheView,RefX,RefY,RefTolerance);
				
				if (FeatureIndex==TargetFeatureIndex) Result=true;
			}
		}
	}
 	return(Result);
}
/*
* returns the feature index for the coordinate in projected space
* returns -1 if the coordinate is not in a feature
*/
CMDatasetPyramid.prototype.In=function(TheView,RefX,RefY,RefTolerance) 
{
	var FeatureIndex=-1;
	
//	if (this.GetVisible())//&&(this.TheData!=null))
	{
		for (var Row=0;(Row<this.NumRows)&&(FeatureIndex==-1);Row++)
		{
			for (Column=0;(Column<this.NumColumns)&&(FeatureIndex==-1);Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				FeatureIndex=TheTile.In(TheView,RefX,RefY,RefTolerance);
			}
		}
	}
 	return(FeatureIndex);
};
CMDatasetPyramid.prototype.GetHeadingIndex=function()
{
	if (this.HeadingIndex==-1)
	{
		for (var i=0;i<this.AttributeInfo.Attributes.Headings.length;i++)
		{
			var Heading=this.AttributeInfo.Attributes.Headings[i];
			
			if (Heading==this.HTMLAttribute)
			{
				this.HeadingIndex=i;
			}
		}
	}
}
/**
* Display the info window if the user clicked on a feature
*/
CMDatasetPyramid.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	if (this.HTMLAttribute!=null)
	{
		this.GetHeadingIndex();
		
		var TheColumn=this.Attributes.Values[this.HeadingIndex]; // jjg - need to reconcild headings with column indexes
		var TheHTML=TheColumn[FeatureIndex];
		
		var InfoWindow=TheView.CreateInfoWindow("CMDatasetPyramid.InfoWindow",RefX,RefY,200,30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
}

CMDatasetPyramid.prototype.MouseDown=function(TheView,RefX,RefY,RefTolerance) 
{
	var Used=false;
	
	if ((this.IsVisible(TheView))&&
		((TheView.GetTool()==CMView.TOOL_INFO)&&(TheView.GetTool()==CMView.TOOL_SELECT))) // check if we where clicked in
	{
		for (var Row=0;(Row<this.NumRows)&&(Used==false);Row++)
		{
			for (Column=0;(Column<this.NumColumns)&&(Used==false);Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				Used=TheTile.MouseDown(TheView,RefX,RefY,RefTolerance);
			}
		}
	}
	return(Used);
};
//**************************************************************
// Protected functions
//**************************************************************
CMDatasetPyramid.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
CMDatasetPyramid.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}

//**************************************************************
// CMDataset Attribute functions
//**************************************************************
CMDatasetPyramid.prototype.GetNumAttributeRows=function() 
{ 
	var Result=0;
	if (this.AttributeInfo.Attributes!=null)
	{
		Result=this.AttributeInfo.NumRows;
	}
	return(Result); 
}
CMDatasetPyramid.prototype.GetNumAttributeColumns=function() 
{ 
	var Result=0;
	if (this.AttributeInfo!=null)
	{
		Result=this.AttributeInfo.NumRows;
	}
	return(Result); 
}
CMDatasetPyramid.prototype.GetAttributeHeading=function(ColumnIndex) 
{ 
	var Result="";
	if (this.AttributeInfo!=null)
	{
		Result=this.AttributeInfo.Attributes[ColumnIndex];
	}
	return(Result); 
}
CMDatasetPyramid.prototype.GetAttributeCellByHeading=function(Heading,RowIndex)  //jjg
{ 
	var Result=null;
	
	var ColumnIndex=this.GetAttributeIndexFromHeading(Heading);
	
	if (ColumnIndex==-1) 
	{
		throw("Sorry, the heading "+Heading+" was not found");
	}
	else
	{
		Result=this.GetAttributeCell(ColumnIndex,RowIndex);
	}
	return(Result);
}

CMDatasetPyramid.prototype.GetAttributeIndexFromHeading=function(Heading) 
{ 
	var Result=-1;
	if (this.AttributeInfo!=null)
	{
		for (var i=0;i<this.AttributeInfo.Attributes.length;i++)
		{
			if (this.AttributeInfo.Attributes[i].Heading==Heading)
			{
				Result=i;
			}
		}
	}
	return(Result); 
}
CMDatasetPyramid.prototype.GetAttributeCell=function(ColumnIndex,RowIndex) 
{ 
	var Result="";
	if (this.Attributes!=null)
	{
		var TheColumn=this.Attributes[ColumnIndex]; 
		Result=TheColumn[RowIndex];
	}
	return(Result); 
}
/*
* Called to load a column of attributes.
* @protected
*/

CMDatasetPyramid.prototype.LoadAttributeColumn=function(ColumnIndex) 
{
	var URL=this.URL+"Attributes/AttributeColumn_"+ColumnIndex+".js";

	var TheRequest=new XMLHttpRequest();
	
	TheRequest.open("GET",URL,true);
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this;
	TheRequest.ColumnIndex=ColumnIndex;
			
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
			if( this.status == 200) // OK
			{
				var TheText=this.responseText;

				var TheInfo=JSON.parse(TheText);
				
				//*******************
				
				if (this.TheDataset.Attributes==undefined) this.TheDataset.Attributes=[];
				
				this.TheDataset.Attributes[this.ColumnIndex]=TheInfo.Values;
				
				this.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_ATTRIBUTES_CHANGED);
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
}
CMDatasetPyramid.prototype.GetRasterFileExtension=function() 
{
	return(".png");
}
//******************************************************************
// Functions used by subclasses and not overriden
//******************************************************************

/**
* Gets the bounds for a specific feature, if any
*/
CMDatasetPyramid.prototype.GetFeatureBounds=function(FeatureIndex) 
{
	var Result=null;
	
	for (var Row=0;Row<this.NumRows;Row++)
	{
		for (Column=0;Column<this.NumColumns;Column++)
		{
			var TheTile=this.Tiles[Row][Column];
			
			Result=TheTile.AddToFeatureBounds(FeatureIndex,Result);
		}
	}
	return(Result);
}
//******************************************************************
// Textured 3d Tiles
//******************************************************************

/**
* Gets the bounds for a specific feature, if any
*/
CMDatasetPyramid.prototype.SetVisible=function(TheLayer,Flag) 
{
	var Result=null;
	
	if (Flag==false)
	{
		for (var Row=0;Row<this.NumRows;Row++)
		{
			for (Column=0;Column<this.NumColumns;Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				TheTile.HideTiles(TheLayer,true);
			}
		}
	}
	this.Visible=Flag;
	return(Result);
}

//******************************************************************
// Textured 3d Tiles
//******************************************************************
/**
*
*/
CMDatasetPyramid.prototype.GetDataForTextureTile=function(TheView,TheTextureTile,Exaggeration,TheLayer)
{
	var Result=null;
	
	for (var Row=0;(Row<this.NumRows)&&(Result==null);Row++)
	{
		for (Column=0;(Column<this.NumColumns)&&(Result==null);Column++)
		{
			var TheTile=this.Tiles[Row][Column];
			
			Result=TheTile.GetDataForTextureTile(TheView,TheTextureTile,Exaggeration,TheLayer);
		}
	}
	return(Result);
}

//******************************************************************
// Painting
//******************************************************************
/*
* Paints a layer into the canvas
*/
CMDatasetPyramid.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
	if ((this.NumRows!=undefined)&&(SelectedOnly==false)&&((MouseOverOnly==undefined)||(MouseOverOnly==false)))
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		for (var Row=0;Row<this.NumRows;Row++)
		{
			for (Column=0;Column<this.NumColumns;Column++)
			{
				var TheTile=this.Tiles[Row][Column];
				
				TheTile.PaintTile(TheLayer,TheView,SelectedOnly,this.TileRefWidth);
			}
		}
	}
}
//******************************************************************
// Searching
//******************************************************************

/*
* Requests search results from a layer.  The scene calls this function
* @protected
*/
CMDatasetPyramid.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
	var TheText="";
	
	if ((this.AttributeInfo!=null))
	{
		var NumRows=this.GetNumAttributeRows();
		var NumColumns=this.GetNumAttributeColumns();
		
		// draw each feature
		for (var ColumnIndex=0;ColumnIndex < NumColumns; ColumnIndex++) 
		{
			var TheColumn=this.Attributes[ColumnIndex]; // needs request
			
			if (TheColumn!=undefined) // jjg - need a way to indicate which columsn to search
			{
				for (var RowIndex=0;RowIndex < NumRows; RowIndex++) 
				{
					var TheValue=TheColumn[RowIndex];
					
					TheValue=TheValue.toLowerCase();
					
					if (TheValue.indexOf(SearchPhrase)!=-1)
					{
						var ThisResult=document.createElement("DIV");
						ThisResult.innerHTML=TheColumn[RowIndex];
						
						ThisResult.TheLayer=this;
						ThisResult.FeatureIndex=RowIndex;
						
						ThisResult.onclick=function()
						{
							this.TheLayer.TheScene.UnselectAll();
							this.TheLayer.SetSelectedFeature(this.FeatureIndex);
							
							var TheBounds=this.TheLayer.GetFeatureBounds(this.FeatureIndex);
							var TheView=this.TheLayer.TheScene.GetView(0);
							
							this.className="CM_SearchResultSelected";
							
							TheView.ZoomToBounds(TheBounds);
						}
						ResultsPanel.appendChild(ThisResult);
					}
				}
			}
		}
	}
	return(TheText);
}

//CanvasMap/js/CMDatasetPyramidOpenFormat.js
/******************************************************************************************************************
* CMDatasetPyramidOpenFormat
*
* @module CMDatasetPyramidOpenFormat
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMDatasetPyramidOpenFormat() 
{
	CMDataset.call(this);

	// properties
	this.TopTile=null; // first tile at ZoomLevel=-18, one tile=whole world
	this.Visible=true; // keeps track of visibility so we know when to make the tiles invisible (jjg - setting?)
	
	this.TileWidthInPixels=256;
	
	this.PaintDebugTile=false; // (jjg - setting?)
	this.DebugZoomLevel=-1;
	this.DebugGlobalColumn=0;
	this.DebugGlobalRow=0;
	
	this.MeshIsInGeo=false;
	this.TheMesh=null;
	
	this.FileExtension=null;
	
	// OpenPyramids do not have a bounds so we have to assume the entire world
	this.TheBounds={
		XMin:-180,
		XMax:180,
		YMin:-90,
		YMax:90
	};

}
CMDatasetPyramidOpenFormat.prototype=Object.create(CMDataset.prototype); // inherit prototype functions from PanelBase()

CMDatasetPyramidOpenFormat.prototype.contructor=CMDatasetPyramidOpenFormat; // override the constructor to go to ours

//******************************************************************
// Functions used by subclasses and not overriden
//*****************************************************************
CMDatasetPyramidOpenFormat.prototype.SetDebugTile=function(ZoomLevel,GlobalColumn,GlobalRow) 
{
	this.PaintDebugTile=true;
	this.DebugZoomLevel=ZoomLevel;
	this.DebugGlobalColumn=GlobalColumn;
	this.DebugGlobalRow=GlobalRow;
}

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMDatasetPyramidOpenFormat.prototype.SetURL=function(URL) 
{
	if (this.URL!=URL)
	{
		// get the file extension, if any
		
		URL=URL.trim();
		
		var LastChar=URL[URL.length-1];
		
		if (LastChar!="}") // have an extension
		{
			var Index=URL.lastIndexOf(".");
		
			this.FileExtension=URL.substr(Index+1);
		}
		
		// strip off the z,x,y 
		
		var XIndex=URL.indexOf("{x}");
		var YIndex=URL.indexOf("{y}");
		var ZIndex=URL.indexOf("{z}");
		
		var StartIndex=ZIndex;
		
		this.CoordinateValueOrder=[];
		
		if (XIndex<YIndex) // is before y (x is first or second)
		{
			if (XIndex<ZIndex) // x is before z (x is first)
			{
				StartIndex=XIndex;
				
				if (YIndex<ZIndex) this.CoordinateValueOrder=["x","y","z"];
				else this.CoordinateValueOrder=["x","z","y"];
			}
			else // (x is before y and after z)
			{
				this.CoordinateValueOrder=["z","x","y"];
			}
		}
		else // x is after y
		{
			if (XIndex<ZIndex) // x is after y and before z
			{
				this.CoordinateValueOrder=["y","x","z"];
			}
			else // x is after z (x is at the end)
			{
				if (YIndex<ZIndex) 
				{
					StartIndex=YIndex;
				
					this.CoordinateValueOrder=["y","z","x"];
				}
				else this.CoordinateValueOrder=["z","y","x"];
			}
		}
		
		// strip off everything after the first brace
		
		URL=URL.substr(0,StartIndex);
	
		// save the information
		
		this.URL=URL;
	
		//
	
		this.TopTile=new CMTileOpenFormat(this,-18,0,0);
	
		this.GetParent(CMScene).Repaint();
	}
}
CMDatasetPyramidOpenFormat.prototype.GetCoordinateValueOrder=function() 
{
	return(this.CoordinateValueOrder);
}
//******************************************************************
// CMDatasetPyramid Functions
//******************************************************************
CMDatasetPyramidOpenFormat.prototype.GetRasterFileExtension=function() 
{
	return(this.FileExtension);
}

CMDatasetPyramidOpenFormat.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}

/**
* Making things visible is handled in paint but child tiles must be 
* make invisible through SetVisible()
* @protected
*/
CMDatasetPyramidOpenFormat.prototype.SetVisible=function(TheLayer,Flag) 
{ 
	// we only have to make the files hidden when they are visible
	// they will be made visible on a repaint if hidden and then switched to visible
	if ((this.Visible)&&(Flag==false)&&(this.TopTile!=null))
	{
		this.TopTile.HideTiles(TheLayer,true);
		
		if ((this.MeshIsInGeo))
		{
			var TheGeo=TheLayer.GetParent(CMGeo);
			TheGeo.RemoveOGLObject(this.TheMesh);
			TheGeo.RemoveOGLObject(this.TopMesh);
			TheGeo.RemoveOGLObject(this.BottomMesh);
			this.MeshIsInGeo=false;
		}
	}
	this.Visible=Flag;
}

//******************************************************************
// Painting
//******************************************************************

/*
* Paints a layer into the canvas
*/
CMDatasetPyramidOpenFormat.prototype.Paint=function(TheLayer,TheView,SelectedOnly,MouseOverOnly) 
{
	if ((SelectedOnly==false)&&((MouseOverOnly==undefined)||(MouseOverOnly==false)))
	{
		if ((typeof(CM3View)!="undefined")&&(TheView instanceof CM3View)) // have a 3d view
		{
			if ((TheLayer.GetVisible())&&(this.MeshIsInGeo==false))
			{
				var TheGeo=TheLayer.GetParent(CMGeo);
				var TheProjector=TheGeo.GetProjector();
				
				if ((TheProjector!=null)&&(TheProjector instanceof CM3ProjectorSpherical))
				{
					var NorthPoleColor=TheLayer.GetSetting("Dataset","NorthPoleColor");
					var SouthPoleColor=TheLayer.GetSetting("Dataset","SouthPoleColor");
					
					var points = [];
					
					if ((NorthPoleColor!=undefined)||(SouthPoleColor!=undefined))
					{
						for ( var i = 83; i <=90; i ++ ) 
						{
							var Coordinate=TheGeo.ProjectFromGeographic(0, i, 0);
							
							var Vector2=new THREE.Vector2(Coordinate[0],Coordinate[2]);
							
							points.push( Vector2 );
						}
					}
					if (NorthPoleColor!=undefined)
					{
						var geometry = new THREE.LatheBufferGeometry( points );
						var material = new THREE.MeshBasicMaterial( { color: NorthPoleColor } );
						this.TopMesh = new THREE.Mesh( geometry, material );
						
						//var Coordinate=TheGeo.ProjectFromGeographic(0, 90, 0);
						this.TopMesh.rotateX(Math.PI/2);
						
						TheGeo.AddOGLObject(this.TopMesh);
					}
					if (SouthPoleColor!=undefined)
					{
						var material = new THREE.MeshBasicMaterial( { color: SouthPoleColor } );
						this.BottomMesh = new THREE.Mesh( geometry, material );
						this.BottomMesh.rotateX(-Math.PI/2);
						
						TheGeo.AddOGLObject(this.BottomMesh);
					}
					this.MeshIsInGeo=true;
				}
			}
		}
		this.TopTile.PaintTile(TheLayer,TheView,SelectedOnly,MouseOverOnly);
	}
}



//CanvasMap/js/CMTileOpenFormat.js
/******************************************************************************************************************
* CMTileOpenFormat
*
* @module CMTileOpenFormat
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Global Variables
//******************************************************************

// A count of the total number of tiles that have been loaded for debugging and performance monitoring
CMTileOpenFormat.NumTilesLoaded=0;

//******************************************************************
// Tile Constructor
//******************************************************************
function CMTileOpenFormat(TheDataset,ZoomLevel,GlobalColumn,GlobalRow)
{
	CMTile.call(this);
	
	// Settings?
	this.PaintTileInfo=false; // for debugging (jjg - move to settings)
	
	// Properties
	this.GlobalRow=GlobalRow;
	this.GlobalColumn=GlobalColumn;
	this.ZoomLevel=ZoomLevel;

	this.TheRaster=null; // raster image
	this.TheRasterRequest=null;
	
	this.ChildTiles=null;
	this.TheDataset=TheDataset;
	
	this.MeshIsInGeo=false;
	this.TheMesh=null;
}
CMTileOpenFormat.prototype=Object.create(CMTile.prototype); // inherit prototype functions from PanelBase()

CMTileOpenFormat.prototype.contructor=CMTileOpenFormat; // override the constructor to go to ours

//******************************************************************
// Private CMTileOpenFormat functions
//******************************************************************

/**
* Converts the specified coordinate into global coordinate using the 
* current projection.  This function is specific for the OpenFormat
* because it assumes the tiles are in the Google Mercator spatial reference.
* @private
*/
CMTileOpenFormat.GetGlobalCoordinate=function(TheLayer,OX,OY,Elevation)
{
	var TheGeo=TheLayer.GetParent(CMGeo);
	var TheGoogleMapsProjector=new CMProjectorGoogleMaps();
	TheGoogleMapsProjector.SetZoomLevel(18);

	var Result=TheGoogleMapsProjector.ProjectToGeographic(OX,OY);

	var Lon=Result[0];
	var Lat=Result[1];
	
	// project the coordinate
	
	var Result=TheGeo.ProjectFromGeographic(Lon, Lat, Elevation);
	
	return(Result);
}

//******************************************************************
// Protected CMTile functions
//******************************************************************
/**
* Returns the full path to this tile's file
* @protected
*/
CMTileOpenFormat.prototype.GetTileImageFilePath=function() 
{
	var ThePath=null;
	
	var ZoomLevel=this.ZoomLevel;
	var Row=this.GlobalRow;
	var Column=this.GlobalColumn;
	
	var FileExtension=this.TheDataset.GetRasterFileExtension();
	
	var ZoomLevel=18+ZoomLevel;//+this.ZoomLevelOffset;
	
	var StepColumn=Column;
	var StepRow=Row;
	
	var CoordinateValueOrder=this.TheDataset.GetCoordinateValueOrder();
	
	if ((StepColumn>=0)&&(StepRow>=0)) // only load valid tiles
	{
		var FileName="";
		
		for (var i=0;i<3;i++)
		{
			if (i!=0) FileName+="/";
			
			if (CoordinateValueOrder[i]=="x") { FileName+=StepColumn; }
			if (CoordinateValueOrder[i]=="y") { FileName+=StepRow; }
			if (CoordinateValueOrder[i]=="z") { FileName+=ZoomLevel; }
		}
		if (FileExtension!=null) FileName+="."+FileExtension;
		
		var ThePath=this.TheDataset.URL+FileName;
	}
	return(ThePath);
}
//******************************************************************
// Protected CMTile functions
//******************************************************************
CMTileOpenFormat.TheProjectorGoogleMaps=null;

CMTileOpenFormat.AllocateProjectorGoolgeMaps=function()
{
	if (CMTileOpenFormat.TheProjector==null)
	{
		//var TheProjector=this.TheDataset.GetProjector();
		CMTileOpenFormat.TheProjectorGoogleMaps=new CMProjectorGoogleMaps();
		CMTileOpenFormat.TheProjectorGoogleMaps.SetZoomLevel(18);
	}
}

CMTileOpenFormat.prototype.GetTileRefWidthAsGoogleMercator=function() 
{
	var Factor=1/Math.pow(2,this.ZoomLevel); // width of one pixel
	var TileRefWidth=256*Factor; // width of a tile

	return(TileRefWidth);
}

CMTileOpenFormat.prototype.GetTileExtentAsGoogleMercator=function() 
{
	var TileRefWidth=this.GetTileRefWidthAsGoogleMercator();
	
	var RefX=(this.GlobalColumn*TileRefWidth);
	var RefY=-(this.GlobalRow*TileRefWidth); // The rows go from top to bottom so the row is 0 on top, large positive number on the bottom
	
	var Extent={
		"XMin":RefX,
		"XMax":RefX+TileRefWidth,
		"YMax":RefY, // top of the tile
		"YMin":RefY-TileRefWidth // bottom of the tile
	}
	return(Extent);
}

CMTileOpenFormat.prototype.GetTileExtentAsGeographic=function() 
{
	CMTileOpenFormat.AllocateProjectorGoolgeMaps();
	
	var Extent=this.GetTileExtentAsGoogleMercator();
	
	var UpperLeft=CMTileOpenFormat.TheProjectorGoogleMaps.ProjectToGeographic(Extent.XMin,Extent.YMax);
	
	var LowerRight=CMTileOpenFormat.TheProjectorGoogleMaps.ProjectToGeographic(Extent.XMax,Extent.YMin);
	
	Extent={
		"XMin":UpperLeft[0],
		"XMax":LowerRight[0],
		"YMax":UpperLeft[1], // top of the tile
		"YMin":LowerRight[1], // bottom of the tile
		"ZMax":UpperLeft[2], 
		"ZMin":LowerRight[2] 
	}
	
	return(Extent);
}

CMTileOpenFormat.prototype.GetTileExtentAsProjected=function(TheLayer) 
{
	var Elevation=0;
	
	var Extent=this.GetTileExtentAsGoogleMercator();
	
	// temporary solution jjg 
	var TheGeo=TheLayer.GetParent(CMGeo);
	var TheProjector=TheGeo.GetProjector();
	if (TheProjector!=null)
	{
		CMTileOpenFormat.AllocateProjectorGoolgeMaps();
	
		var UpperLeft=CMTileOpenFormat.TheProjectorGoogleMaps.ProjectToGeographic(Extent.XMin,Extent.YMax);
		
		UpperLeft=TheProjector.ProjectFromGeographic(UpperLeft[0],UpperLeft[1],Elevation);
		
		var LowerRight=CMTileOpenFormat.TheProjectorGoogleMaps.ProjectToGeographic(Extent.XMax,Extent.YMin);
		
		LowerRight=TheProjector.ProjectFromGeographic(LowerRight[0],LowerRight[1],Elevation);
		
		Extent={
			"XMin":UpperLeft[0],
			"XMax":LowerRight[0],
			"YMax":UpperLeft[1], // top of the tile
			"YMin":LowerRight[1], // bottom of the tile
			"ZMax":UpperLeft[2], 
			"ZMin":LowerRight[2] 
		}
	}
	
	return(Extent);
}
/**
* OpenFormat tiles are always in GoogleMercator projection so we don't
* need to have a projector in the Geo and we may not so we create one
* and use it here
*//*
CMTileOpenFormat.TheProjectorGoogleMaps=null;

CMTileOpenFormat.prototype.GetTileExtentAsGeographic=function(TheLayer) 
{
	var Extent=this.GetTileExtent(TheLayer);
	
	if (CMTileOpenFormat.TheProjector!=null)
	{
		var Result1=CMTileOpenFormat.TheProjector.ProjectToGeographic(Extent.XMin,Extent.YMin);
		var Result2=CMTileOpenFormat.TheProjector.ProjectToGeographic(Extent.XMax,Extent.YMax);
		
		Extent.XMin=Result1[0];
		Extent.YMin=Result1[1];
		Extent.XMax=Result2[0];
		Extent.YMax=Result2[1];
	}
	return(Extent);
}*/

//******************************************************************
// Protected CMTile functions
//******************************************************************

/*
* Check if we should paint this tile or it's four child tiles.
* 
* This is a little complicated because we have to
* decide if we are going to paint this tile or paint it's children.
* If we are painting this tile, then we either need to paint the vectors
* fill the tile with a single color (uniform raster pixel or tile in the
* middle of a filled polygon
*
* Algorithm to decide if painting this tile:
*
* 	if PaintDebugTile) paint this tile
* 	else
* 		if this tile's pixel width is less than or equal to 256 paint this tile
* 		else 
* 			if any of the children have not been loaded paint this tile (and load the children)
*			if any of the children are still loading, paint this tile
*			count the number of child tiles that are
*				loaded and
*				vector data or raster data with a color or a loaded raster tile
*				or empty tiles
*			if the number is less than 4, paint this tile
*
* @private
*/

CMTileOpenFormat.prototype.CheckPaintTile=function(TheView,ThisStepTileRefWidth,TheLayer) 
{
	var PaintTile=false; 

	// see if we should paint because we are debugging a tile
	if (this.TheDataset.PaintDebugTile)
	{
		if ((this.TheDataset.DebugZoomLevel==this.ZoomLevel)&&
			(this.TheDataset.DebugGlobalColumn==this.GlobalColumn)&&
			(this.TheDataset.DebugGlobalRow==this.GlobalRow))
		{
			PaintTile=true; // paint the tile being debugged
		}
	}
	else // otherwise, check if this tile needs to be painted
	{
		if (PaintTile==false) // see if we should 
		{
			var PaintChildren=false;
			
			// If this tile has a high enough resolution, just paint it
			if ((typeof(CM3View)!="undefined")&&(TheView instanceof CM3View))
			{
				var Distance=CMTile.GetDistanceTo3DView(TheView,this.GetTileExtentAsGeographic(),TheLayer);
				
				if (Distance>ThisStepTileRefWidth*3) PaintTile=true;
			}
			else
			{
				var ThisStepsTilePixelWidth=TheView.GetPixelWidthFromRefWidth(ThisStepTileRefWidth);
	
				if (ThisStepsTilePixelWidth<=256) PaintTile=true; // resolution is low, paint this tile
				else if (ThisStepsTilePixelWidth<=512)
				{
					PaintChildren=true;
				}
			}
			if ((PaintTile==false))
			{
				// If there are no children, paint this tile
				if (this.ZoomLevel==0)  
				{
					PaintTile=true; // at the bottom, render this tile
				}
				// If we're not going to paint this tile, check to see if we should paint, or load, the child tiles
				else // see if we have 4 child tiles ready to be painted (or are empty)
				{
					//if (this.TheData.NumChildTiles>0) // this tile does have child tiles
					{
						NumLoadedChildTiles=0;
						
						// allocate the child tiles if they are not already there.
						if (this.ChildTiles==null) // initialize the child tiles array
						{
							this.ChildTiles=[];
							this.ChildTiles[0]=[null,null];
							this.ChildTiles[1]=[null,null];
						}
						
						// go through the 4 child tiles
						for (var RowIndex=0;RowIndex<2;RowIndex++)
						{
							for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
							{
								// initialize the child tile if needed
								if (this.ChildTiles[RowIndex][ColumnIndex]==null)
								{
									var ChildZoomLevel=this.ZoomLevel+1;
									var ChildColumn=(this.GlobalColumn*2)+ColumnIndex;
									var ChildRow=(this.GlobalRow*2)+(1-RowIndex);
									
									// create the tile, loads are initiated on paint
									var TheChildTile=new CMTileOpenFormat(this.TheDataset,ChildZoomLevel,ChildColumn,ChildRow);
									
									if (this.PaintTileInfo) TheChildTile.SetPaintTileInfo(this.PaintTileInfo);
									
									this.ChildTiles[RowIndex][ColumnIndex]=TheChildTile;
								}
								// if we are painting children, make sure the images are loaded
								if (PaintChildren) // have an existing child tile
								{
									var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];
	
									if (TheChildTile.TheRasterRequest==null)
									{
										TheChildTile.LoadTileRaster();
									}
									else 
									{
										if (TheChildTile.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_NONE) 
										{
											// tile child tile has not been loaded, load it now for the next repaint
											TheChildTile.LoadTileRaster();
											// have to paint this tile
											//PaintTile=true;
										}
										else if (TheChildTile.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADING)
										{
											// cihld tile has not finished loading, have to paint this tile
											//PaintTile=true;
										}
										else 
										{
											if (TheChildTile.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
											{
												NumLoadedChildTiles++;
											}
											else if (TheChildTile.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_CANCELED)
											{
												this.LoadTileRaster(); // try again
											}
										}
									}
								}
							}
						}
						// unless this tile is not completely covered by child tiles, paint it	
						if (NumLoadedChildTiles<4) 
						{
							//PaintTile=true;
						}
					}
					//PaintTile=false;
				}
			}
		}
	}
	return(PaintTile);
}

/*
* Sets up a grid-based goemetry to hold the coordinates for the projected space
* @protected
*/
CMTileOpenFormat.prototype.SetupGeometry=function(TheLayer) 
{
	CMTileOpenFormat.AllocateProjectorGoolgeMaps();
	
	var TheGeo=TheLayer.GetParent(CM3Geo);
	
	var Extent=this.GetTileExtentAsGoogleMercator(TheLayer);
	
	var TheArray=[];
	
	var XMin=Extent.XMin;
	var XMax=Extent.XMax;
	var YMin=Extent.YMin;
	var YMax=Extent.YMax;
	
	var RowRefHeight=(YMax-YMin)/16;
	var ColumnRefWidth=(XMax-XMin)/16;
	
	for (var Row=0;Row<=16;Row++)
	{
		var TheRow=[];
		TheArray[Row]=TheRow;
		
		for (var Column=0;Column<=16;Column++)
		{
			TheRow[Column]=[];
			
			// convert tile coordinates to geographic
			var Northing=YMin+(Row*RowRefHeight);
			var Easting=XMin+(Column*ColumnRefWidth);
			
			var Result=CMTileOpenFormat.TheProjectorGoogleMaps.ProjectToGeographic(Easting,Northing);
			
			var Lon=Result[0];
			var Lat=Result[1];
			
			// convert geographic coordinates to spherical
			var Elevation=0;//TheElevationGroup.Offset;
			
			// project the coordinate
			var Result=TheGeo.ProjectFromGeographic(Lon, Lat, Elevation);
			
			// setup the grid to contain the projected coordinate
			TheRow[Column]=Result;
		}
	}
	
	// setup the THREEE geomery which will become part of the mesh
	var NumColumns=TheArray[0].length;
	var NumRows=TheArray.length;
	
	var TheGeometry=new CM3SurfaceGeometry(NumColumns-1,NumRows-1);
	
	// set the positions within the grid
	TheGeometry.SetPositions(TheArray);
				
	return(TheGeometry);
}
//***********************************************************************
// Protected CMTileOpenFormat functions
//***********************************************************************

/**
* Paint a single tile.  Adds appropriate content to the Geo based on the content type.
* @protected
*/
CMTileOpenFormat.prototype.PaintTile=function(TheLayer,TheView,SelectedOnly) 
{
	var NumPainted=0; // 1 if this tile painted it's contents, 0 otherwise
		
	var Extent=this.GetTileExtentAsProjected(TheLayer);
	
	var PaintTile=true; // true to paint this tile, false to paint children
	
	//***********************************************************
	// 3D painting
	if ((typeof(CM3View)!="undefined")&&(TheView instanceof CM3View)) // have a 3d view
	{
		if ((TheLayer.GetVisible()))
		{
			// jjg - cheating a bit here and finding the disance from one corner of the tile
			// to the other corner (should do this in the projector where arc disances can be computed)
			
/*			var Result1=CMTileOpenFormat.GetGlobalCoordinate(TheLayer,Extent.XMin,Extent.YMin,0);  // south west to 
			var Result2=CMTileOpenFormat.GetGlobalCoordinate(TheLayer,Extent.XMax,Extent.YMax,0); // north east
			
			var DX=Result1[0]-Result2[0];
			var DY=Result1[1]-Result2[1];
			var DZ=Result1[2]-Result2[2];
*/			var DX=Extent.XMax-Extent.XMin;
			var DY=Extent.YMax-Extent.YMin;
			var DZ=Extent.ZMax-Extent.ZMin;
			
			var TileRefWidth2=Math.sqrt(DX*DX+DY*DY+DZ*DZ)*2/2;
	
			// check if we are going to paint this tile or go after child tiles
			PaintTile=this.CheckPaintTile(TheView,TileRefWidth2,TheLayer);
			
			if (PaintTile) // painting this tile
			{
				if (this.ChildTiles!=null) // if we have child tiles, hide item
				{
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						if (this.ChildTiles[RowIndex]!=null)
						{
							for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
							{
								if (this.ChildTiles[RowIndex][ColumnIndex]!=null)
								{
									var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];
									
									TheChildTile.HideMesh(TheLayer);
								}
							}
						}
					}
				}
				//*************************************************************************
				// paint a raster from a raster file (e.g. PNG or JPG)
				if (this.MeshIsInGeo==false) // the mesh is not in the Geo, we need to add it
				{
					if (this.TheMesh==null) // the mesh is not available, we need to create it
					{
						// try to get the DEM info
						var TheGeometry=this.SetupGeometry(TheLayer);
						
						// setup the material
						var TheFileName=this.GetTileImageFilePath();
						
						// setup the material
						var SolidColorMaterial=CMTile.GetNewMaterial(TheFileName);
					
						// setup the mesh
						this.TheMesh=new THREE.Mesh(TheGeometry,SolidColorMaterial);
					}
					// add the mesh to the geo
					
					if (this.TheMesh!=null)
					{ 
						var TheGeo=TheLayer.GetParent(CMGeo);
						TheGeo.AddOGLObject(this.TheMesh);
						
//						var helper = new THREE.VertexNormalsHelper( this.TheMesh, 20, 0x00ff00, 10 );
//						TheGeo.AddOGLObject(helper);
						
						this.MeshIsInGeo=true;
					}
				}
			}
			if (PaintTile==false) // remove this tile from the Geo, if needed, and paint the children
			{
				this.HideMesh(TheLayer);
			}
		}
	}
	//**************************************************************
	// 2D painting
	else if(CMUtilities.BoundsOverlap(Extent,TheView.GetBounds()))
	{
		var TileRefWidth=Extent.XMax-Extent.XMin;
	
		var RefX=Extent.XMin; 
		var RefY=Extent.YMax;
		
		//if ((this.TheData!=null)) // data will be null until recieved
		{
			// paint the child
			
			PaintTile=this.CheckPaintTile(TheView,TileRefWidth);
			
			var NumChildrenPainted=0;
			if (PaintTile) // paint this tile instead of the children
			{
				if (this.TheRasterRequest!=null)
				{
					if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
					{
						var ImageRefWidth=TileRefWidth;
						var ImageRefHeight=-TileRefWidth;
						
						var ImageRefX=RefX;
						var ImageRefY=RefY;
						
						TheView.PaintRefImageScaled(this.TheRaster,ImageRefX,ImageRefY,ImageRefWidth,ImageRefHeight);
					}
					else if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_CANCELED)
					{
						this.LoadTileRaster();
					}
				}
				else
				{
					this.LoadTileRaster();
				}
			}
		}
		//*************************************************************************
		// paint the debugging information (2d)
		if (PaintTile) // 
		{
			if ((this.PaintTileInfo))
			{
				var TheStyle2={ 
					"font":"20px Arial",
					"fillStyle":"red",
					"lineWidth":1,
					"strokeColor": "red",
					"strokeStyle":"#000",
				};
				if (TheStyle2!=null) TheView.SetStyle(TheStyle2);
					
				var CenterX=RefX+TileRefWidth/2;
				var CenterY=RefY-TileRefWidth/2;
				
				var TheText=this.ZoomLevel+"_"+this.GlobalColumn+"_"+this.GlobalRow;
				
				TheView.PaintRefText(TheText,CenterX,CenterY,20);
				
				TheView.PaintRefLine(RefX,RefY,RefX,RefY-TileRefWidth); // left
				TheView.PaintRefLine(RefX+TileRefWidth,RefY,RefX+TileRefWidth,RefY-TileRefWidth); // right
				
				TheView.PaintRefLine(RefX,RefY,RefX+TileRefWidth,RefY); // top 
				TheView.PaintRefLine(RefX,RefY-TileRefWidth,RefX+TileRefWidth,RefY-TileRefWidth); // bottom
				
				if (TheStyle2!=null) TheView.RestoreStyle();
			}
		}
	}
	//**************************************************************************
	// if nothing was painted above and we have data, try to paint the children
	if (PaintTile==false) // paint the child tiles in this tile
	{
		//if (this.TheData.NumChildTiles>0)
		{
			for (var RowIndex=0;RowIndex<2;RowIndex++)
			{
				for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
				{
					// negative for one feature ID, >0 for mulitple and must load a child tile
					
					if (this.ChildTiles[RowIndex][ColumnIndex]!=null)
					{
						var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];
						
						// the tiles in the next step are 1/2 the reference width of the tiles in this step
						
						var NextStepTileRefWidth=TileRefWidth/2;
						
						//if (TheChildTile.GlobalRow==0)
						{
							NumChildrenPainted+=TheChildTile.PaintTile(TheLayer,TheView,SelectedOnly,NextStepTileRefWidth);
						}
					}
				}
			}
		}
	}
	NumPainted++;
	
	// if the children of this tile painted, we do not need to paint
	
	if (NumChildrenPainted<4)
	{
		var Test=12;
	}
	
	return(NumPainted);
}
//***********************************************************************
// Public CMTileOpenFormat functions
//***********************************************************************
/**
* Sets whether the tile will paint it's debugging information.
* The parent dataset has a setting for this.
* @public
*/
CMTileOpenFormat.prototype.SetPaintTileInfo=function(NewPaintTileInfo) 
{
	this.PaintTileInfo=NewPaintTileInfo;
}
CMTileOpenFormat.prototype.GetData=function() 
{
	throw("Sorry, CMTileOpenFormat does not support GetData()");
}

//CanvasMap/js/CMDialog.js
/**
* CMDialog
* Classes for creating modeless dialog boxes in the web site
* Bootstrap is prefered for modal dialog boxes but these work better for
* modeless.
* @module CMDialog
* @Copyright HSU, Jim Graham, 2019
*/
//******************************************************************
// Private definitions
//******************************************************************

// Default dialog dimensions.
CMDialog.DIALOG_WIDTH=400;
CMDialog.DIALOG_HEIGHT=400;

// Flags for the mode of sizing being used
CMDialog.SIZING_NONE=0;
CMDialog.SIZING_RIGHT=1;
CMDialog.SIZING_BOTTOM=2;
CMDialog.SIZING_BOTTOM_RIGHT=3;

//******************************************************************
// Private Static Functions
//******************************************************************
/**
* Add a close box to the dialog box
*/
CMDialog.CreateCloseBox=function(TheDialog,X,Y,CloseBoxWidth,CloseBoxHeight,TheColor,Callback)
{
	var CloseBox = document.createElement("canvas"); // create the DIV element
	CloseBox.style.position="absolute";
	CloseBox.style.top=Y+"px";
	CloseBox.style.right=X+"px";
	CloseBox.style.width=CloseBoxWidth+"px";
	CloseBox.style.height=CloseBoxHeight+"px";

	CloseBox.style.border="1px solid "+TheColor;
	CloseBox.width=CloseBoxWidth;
	CloseBox.height=CloseBoxHeight;
	
	if (TheDialog instanceof CMDialog) TheDialog.TheElement.appendChild(CloseBox); // add the DisablePage element to the document
	else TheDialog.appendChild(CloseBox);
	
	CloseBox.TheDialog=TheDialog;
	CloseBox.Callback=Callback;
	CloseBox.onmousedown=function(TheEvent)
	{
		if (this.Callback!=undefined) Callback();
		else this.TheDialog.Close();
	};
	// paint the contents of the dialog
	
	CMDialog.PaintCloseBox(CloseBox,CloseBoxWidth,CloseBoxHeight,TheColor);

	return(CloseBox);
}

/**
* Private function to paint the close box
*/
CMDialog.PaintCloseBox=function(CloseBox,CloseBoxWidth,CloseBoxHeight,TheColor)
{
	var TheContext=CloseBox.getContext("2d");
	TheContext.strokeStyle=TheColor;
	TheContext.lineWidth=2;
	
	TheContext.beginPath();
	TheContext.moveTo(0,0);
	TheContext.lineTo(CloseBoxWidth,CloseBoxHeight);
	TheContext.stroke();
	
	TheContext.beginPath();
	TheContext.moveTo(CloseBoxWidth,0);
	TheContext.lineTo(0,CloseBoxHeight);
	TheContext.stroke();
	
	TheContext.strokeRect(1,1,CloseBoxWidth-2,CloseBoxHeight-2);
}
//******************************************************************
// Constructors
//******************************************************************
/*
* Constructor for the dialog
* @public
* @param ID - element ID for the dialog
* @param Width - width of the dialog in pixels (-1 for default)
* @param Height - Height of the dialog in pixels (-1 for default)
* @param PageDisabled - true to have mouse clicks in the rest of the browser disabled until the dialog is closed.
*/
function CMDialog(ID,Width,Height,PageDisabled,Title) 
{
	if (Title==undefined) Title="Dialog";
	
	if (Width==-1) Width=CMDialog.DIALOG_WIDTH;
	if (Height==-1) Height=CMDialog.DIALOG_HEIGHT;
	
	//**************************************************************
	// Create the DIV element for the dialog if not already created
	
	this.TheElement=document.getElementById(ID);
	if (this.TheElement==null)
	{
		this.TheElement=document.createElement("DIV"); // create the DIV element
	
		this.TheElement.id=ID; // set the ID so we can get it back
	
		document.body.appendChild(this.TheElement); // add the dialog element to the document
	}
	else // remove the current contents of the DIV
	{
		while (this.TheElement.firstChild) // while there is a first element in the dialog
		{
			// removing the first element moves the next element to the first position
			// so this little loop will remove all the elements from another element
			this.TheElement.removeChild(this.TheElement.firstChild);
		}
	}
	//**************************************************************
	// Setup member variables
	
	this.Sizing=CMDialog.SIZING_NONE;
	
	//**************************************************************
	// setup the position of the dialog
	
	var TheDialog=this;
	
	this.TheElement.className="CM_SettingsDialog";
	this.TheElement.style.visibility="visible";
	//this.TheElement.style.border="1px solid red";
	//this.TheElement.style.backgroundColor="rgb(210,210,210)";
	
	var DocumentHeight=$(window).height(); 
	var DocumentWidth=$(window).width();
	
	var X=(DocumentWidth-Width)/2;
	var Y=(DocumentHeight-Height)/2;
	
	CMUtilities.AbsolutePosition(this.TheElement,X,Y,Width,Height);
	
	//**************************************************************
	// add the header line
	var TheHeader = document.createElement("DIV");
	TheHeader.className="CM_DialogHeader";

	var TheTextNode = document.createElement("DIV");
	TheTextNode.style.position="relative";
	TheTextNode.style.top="6px";
	TheTextNode.style.left="8px";
	TheTextNode.innerHTML=Title;
	TheHeader.appendChild(TheTextNode);
	this.TheElement.appendChild(TheHeader);

	//**************************************************************
	// add the body 
	var TheBody = document.createElement("DIV");
	TheBody.className="CM_DialogBody";
	this.BodyElement=TheBody;
	this.TheElement.appendChild(this.BodyElement);
	
	//****************************************************************
	// Add the mouse event handlers 
	
	/**
	* Header MouseDown event handler.
	* When the mouse is clicked down in the header of the dialog, the
	* Anchor points are set relative to the upper left corner of the 
	* dialog (and header).  Then the member variable "Dragging" is set to
	* true.
	*/
	TheHeader.addEventListener("mousedown", function(TheEvent)
	{  
		// set the anchor positions relative to the upper left corner of the element
		var rect = TheHeader.getBoundingClientRect();
		TheDialog.AnchorX=TheEvent.clientX-rect.left;
		TheDialog.AnchorY=TheEvent.clientY-rect.top;
		
		TheDialog.Dragging=true;
		
		TheEvent.preventDefault();
	});
	/**
	* Dialog MouseDown event handler.
	* When the mouse is clicked down in the header of the dialog, the
	* Anchor points are set relative to the upper left corner of the 
	* dialog (and header).  Then the member variable "Dragging" is set to
	* true.
	*/
	window.addEventListener("mousedown", function(TheEvent)
	{  
		TheDialog.Sizing=TheDialog.GetSizing(TheEvent);
		
		if (TheDialog.Sizing!=CMDialog.SIZING_NONE)
		{
			TheEvent.preventDefault();
		}
	});
	/**
	* MouseMove event handler.
	* Note that this event handler is added to the window rather than the header.
	* This is so we capture all mouse movements until the mouse button is releated
	* (i.e. the user can move the cursor out of the header while moving the mouse)
	* If we are Dragging the header, the dialog will be positioned based
	* on the position of the mouse and the anchor point.  
	*/
	window.addEventListener("mousemove", function(TheEvent)
	{ 
		if (TheDialog.Dragging)
		{
			// get the position of the document if scrolled
			var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			
			// 
			var rect = TheHeader.getBoundingClientRect();
			var ScreenX=TheEvent.clientX-TheDialog.AnchorX+scrollLeft;
			var ScreenY=TheEvent.clientY-TheDialog.AnchorY+scrollTop;
			
			TheDialog.TheElement.style.left=ScreenX+"px";
			TheDialog.TheElement.style.top=ScreenY+"px";
			
			TheEvent.preventDefault();
		}
		else if (TheDialog.Sizing!=CMDialog.SIZING_NONE) // see if we are sizing the window
		{
			var rect = TheDialog.TheElement.getBoundingClientRect();
			
			var Width=rect.right-rect.left;
			var Height=rect.bottom-rect.top;
			
			if (TheDialog.Sizing==CMDialog.SIZING_BOTTOM_RIGHT)
			{
				Width=TheEvent.clientX-rect.left;
				Height=TheEvent.clientY-rect.top;
			}
			else if (TheDialog.Sizing==CMDialog.SIZING_RIGHT)
			{
				Width=TheEvent.clientX-rect.left;
			}
			else if (TheDialog.Sizing==CMDialog.SIZING_BOTTOM)
			{
				Height=TheEvent.clientY-rect.top;
			}
			
			TheDialog.TheElement.style.width=Width+"px";
			TheDialog.TheElement.style.height=Height+"px";
			
			Width-=6;
			Height-=34;
			
			TheDialog.BodyElement.style.width=Width+"px";
			TheDialog.BodyElement.style.height=Height+"px";
		}
		else // not dragging or sizing
		{
			var Sizing=TheDialog.GetSizing(TheEvent);
			
			switch(Sizing)
			{
			case CMDialog.SIZING_BOTTOM_RIGHT:
				TheDialog.TheElement.style.cursor="nwse-resize";
				break;
			case CMDialog.SIZING_RIGHT:
				TheDialog.TheElement.style.cursor="ew-resize";
				break;
			case CMDialog.SIZING_BOTTOM:
				TheDialog.TheElement.style.cursor="ns-resize";
				break;
			default:
				TheDialog.TheElement.style.cursor="auto";
				break;
			}
		}
	});
	/**
	* If we are Dragging the header, the dialog will be positioned based
	* on the position of the mouse and the anchor point.
	*/
	window.addEventListener("mouseup", function(TheEvent)
	{ 
		if (TheDialog.Dragging)
		{
			TheDialog.Dragging=false;
			
			TheEvent.preventDefault();
		}
		if (TheDialog.Sizing)
		{
			TheDialog.Sizing=CMDialog.SIZING_NONE;
			
			TheEvent.preventDefault();
		}
	});
	// add the close box
	
	var CloseBox=CMDialog.CreateCloseBox(this,8,8,16,16,"#ffffff");

	//****************************************************
	// setup the DisablePage for the dialog
	// This has some issues but covers the entire page with a div to keep the user from cliccking on things
	// i.e. makes the dialog modal
	
	var DisablePageID = "DialogDisablePage"
	this.DisablePage=document.getElementById(DisablePageID);
	if(this.DisablePage==null)
	{
		this.DisablePage=document.createElement("DIV"); // create the DIV element
		this.DisablePage.id=DisablePageID; // set the ID so we can get it back
		document.body.appendChild(this.DisablePage); // add the DisablePage element to the document
	}
	this.DisablePage.style.visibility="hidden";

	if (PageDisabled)
	{
		this.DisablePage.style.backgroundColor="white"; // set the background color of the div element
		this.DisablePage.style.visibility="visible"
		this.DisablePage.style.opacity="0.5"; // set the opacity to 50%
		this.DisablePage.style.zIndex="99999999"; // set the zIndex to be 1 lower than the dialog, placing it directly behind it
												// but above all over elements in the DOM. 
		var DocumentHeight=$(window).height(); 
		var DocumentWidth=$(window).width();

		X=0;
		Y=0;

		CMUtilities.AbsolutePosition(this.DisablePage,X,Y,DocumentWidth,DocumentHeight);
	}
}
//******************************************************************
// private functions
//******************************************************************
CMDialog.prototype.GetSizing=function(TheEvent)
{
	var Result=CMDialog.SIZING_NONE;
	
	var rect = this.TheElement.getBoundingClientRect();
	
	var DX=Math.abs(rect.right-TheEvent.clientX);
	var DY=Math.abs(rect.bottom-TheEvent.clientY);
	
	if ((DX<4)&&(DY<4))
	{
		Result=CMDialog.SIZING_BOTTOM_RIGHT;
	}
	else if (DX<4)
	{
		Result=CMDialog.SIZING_RIGHT;
	}
	else if (DY<4)
	{
		Result=CMDialog.SIZING_BOTTOM;
	}
	return(Result);
}

//******************************************************************
// Functions add elements to the body of the dialog
//******************************************************************
CMDialog.prototype.GetBodyElement=function()
{
	return(this.BodyElement); // add the DisablePage element to the document
	
}
//******************************************************************
// Functions to get and set settings
//******************************************************************
/*
* Makes the dialog visible or invisible
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
*/
CMDialog.prototype.SetVisible=function(New)
{
	if (New)  
	{
		this.TheElement.style.visibility="visible";
		this.DisablePage.style.visibility="visible";
	}
	else 
	{
		this.TheElement.style.visibility="hidden";
		this.DisablePage.style.visibility="hidden";
	}
}
CMDialog.prototype.GetVisible=function()
{
	var Result=false;
	
	if (this.TheElement.style.visibility=="visible")  
	{
		Result=true;
	}
	return(Result);
}
/**
* Add a close box to the dialog box
*/
CMDialog.prototype.Close=function()
{
	this.SetVisible(false);
}

//******************************************************************
// Functions to add widgets
//******************************************************************
/*
* Adds a text label to the dialog
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
*/
CMDialog.AddLabelToPanel=function(TheElement,Text,XOffset,YPosition)
{
	var Label=document.createElement("div");
	Label.innerHTML=Text;
	TheElement.appendChild(Label); // add the dialog element to the document
	CMUtilities.AbsolutePosition(Label,XOffset+10,YPosition,300,30);
	
	return(Label);
}
/*
* Adds a paragraph of text to the dialog.
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Width - width of the paragraph
* @param Height - height of the paragraph
* buttons.
*/
CMDialog.AddParagraphToPanel=function(TheElement,Text,XOffset,YPosition,Width,Height)
{	
	// add the paragraph
	
	var TheControl=document.createElement("p");
	TheControl.innerHTML=Text;
	TheElement.appendChild(TheControl); // add the dialog element to the document

	CMUtilities.AbsolutePosition(TheControl,XOffset+10,YPosition,Width,Height);
	
	return(TheControl);
}
/*
* Creates a color control that displays a color picker
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - Initial value
* buttons.
*/
CMDialog.AddColorControlToPanel=function(TheElement,Label,XOffset,YPosition,Value)
{
	var PenColorLabel=document.createElement("div");
	PenColorLabel.innerHTML=Label;
	TheElement.appendChild(PenColorLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(PenColorLabel,XOffset+10,YPosition,100,30);
	
	var PenColorControl=document.createElement("input");
	
	// using a container and lettnig the browser decide the type of control allows
	// us to be compatible with IE (text field) and the other browsers (color pickters)
	
	var ColorControlContainer=document.createElement("div");
	ColorControlContainer.innerHTML="<input id='ColorControl' type='color'>";
	var PenColorControl=ColorControlContainer.childNodes[0];
	
	// must convert the value to #ffffff format
	
	Value=CMUtilities.GetHexColorFromColor(Value);

	PenColorControl.value=Value;
	TheElement.appendChild(PenColorControl); // add the dialog element to the document
	CMUtilities.AbsolutePosition(PenColorControl,XOffset+110,YPosition,100,20);
	
	return(PenColorControl);
}
/*
* Creates a button with text in it.
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* buttons.
*/
CMDialog.AddButtonControlToPanel=function(TheElement,Text,XOffset,YPosition)
{
	var OKButton=document.createElement("button");
//	OKButton.setAttribute("type", "button"); 
	var ButtonText = document.createTextNode(Text);
    OKButton.appendChild(ButtonText);
	TheElement.appendChild(OKButton); // add the dialog element to the document
	CMUtilities.AbsolutePosition(OKButton,XOffset+10,YPosition,80,30);
	
	return(OKButton);
}
/*
* Function to create a slider control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Min - minimum value for the contorl (i.e. left side)
* @param Max - maximum value for the control (i.e. right side)
* @param Value - initial value for the control
* buttons.
*/
CMDialog.AddSliderControlToPanel=function(TheElement,Text,XOffset,YPosition,Min,Max,Value)
{
	var PenColorLabel=CMUtilities.CreateLabelControl(Text);
	CMUtilities.AbsolutePosition(PenColorLabel,XOffset+10,YPosition,80,30);
	TheElement.appendChild(PenColorLabel); // add the dialog element to the document
	
	var SliderControl=CMUtilities.CreateSliderControl(Min,Max,Value);
	CMUtilities.AbsolutePosition(SliderControl,XOffset+110,YPosition,100,30);
	TheElement.appendChild(SliderControl); // add the dialog element to the document

	return(SliderControl);
}
/*
* Function to create a check box control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - true or false initial state of the checkbox
* buttons.
*/
CMDialog.AddCheckBoxControlToPanel=function(TheElement,Text,XOffset,YPosition,Value)
{
	// add the checkbox
	
	var TheControl=document.createElement("input");
	TheControl.type="checkbox";
	TheControl.name=Text;
	TheControl.text=Text;
	
	if (Value) TheControl.checked=true;
	else TheControl.checked=false;
	
	TheElement.appendChild(TheControl); // add the dialog element to the document

	CMUtilities.AbsolutePosition(TheControl,XOffset,YPosition,40,30);
	
	// add a label after the checkbox
	
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Text;
	TheElement.appendChild(TheLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(TheLabel,XOffset+60,YPosition+8,80,30);
	
	return(TheControl);
}
/*
* Function to create a text edit control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - initial contents of the control
* buttons.
*/
CMDialog.AddTextControlToPanel=function(TheElement,Text,XOffset,YPosition,Value)
{
	// add a label after the checkbox
	
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Text;
	TheElement.appendChild(TheLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(TheLabel,XOffset+10,YPosition+8,100,30);
	
	// add the checkbox
	
	var TheControl=document.createElement("input");
	TheControl.type="text";
	TheControl.name=Text;
	if (Value!=undefined) TheControl.value=Value;
	TheElement.appendChild(TheControl); // add the dialog element to the document

	CMUtilities.AbsolutePosition(TheControl,XOffset+110,YPosition,80,24);
	
	return(TheControl);
}
/*
* Function to create a group of radio buttons.
*
* To determine which buttons is pressed, you will need to go through the returned array
* and see which value is "checked" (i.e. Result[i].checked=true).
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.AddRadioControlToPanel=function(TheElement,Name,XOffset,YPosition,Values,Selected)
{
	var Result=[];
	
	for (var i=0;i<Values.length;i++)
	{
		// add the radiobuttons
		
		var TheControl=document.createElement("input");
		TheControl.type="radio";
		TheControl.name=Name;
		TheControl.value=Values[i];
		
		if (Selected==Values[i]) 
		{
			TheControl.checked=true;
		}
		TheElement.appendChild(TheControl); // add the dialog element to the document
	
		CMUtilities.AbsolutePosition(TheControl,XOffset+10,YPosition,24,24);
		
		// add a label after the checkbox
		
		var TheLabel=document.createElement("div");
		TheLabel.innerHTML=Values[i];
		TheElement.appendChild(TheLabel); // add the dialog element to the document
		CMUtilities.AbsolutePosition(TheLabel,XOffset+50,YPosition+8,100,30);
		
		YPosition+=30;
		
		Result.push(TheControl);
	}
	return(Result);
}
/*
* Function to create a select (popup menu) control
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.AddSelectControlToPanel=function(TheElement,Name,XOffset,YPosition,Values,Selected)
{
	var Result=[];
	var SelectedIndex=-1;
	
	// add a label after the checkbox
	
	var TheLabel=document.createElement("div");
	TheLabel.innerHTML=Name;
	TheElement.appendChild(TheLabel); // add the dialog element to the document
	CMUtilities.AbsolutePosition(TheLabel,XOffset+10,YPosition+8,100,30);
	
	// add the control
	
	var TheControl=CMUtilities.CreateSelectControl(Values,Selected);
	
//	var TheControl=document.createElement("SELECT");
	TheControl.name=Name;
	TheElement.appendChild(TheControl); // add the dialog element to the document
	
	CMUtilities.AbsolutePosition(TheControl,XOffset+110,YPosition,150,24);
	
/*	for (var i=0;i<Values.length;i++)
	{
		if (Selected==Values[i]) SelectedIndex=i;
	
		var option = document.createElement("option");
		option.text =Values[i];
		TheControl.add(option);
	}
	if (SelectedIndex!=-1) TheControl.selectedIndex=SelectedIndex;
*/	
	return(TheControl);
}
//******************************************************************
// Functions to add widjets
//******************************************************************
/*
* Adds a text label to the dialog
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
*/
CMDialog.prototype.AddLabel=function(Text,XOffset,YPosition)
{
	var Label=CMDialog.AddLabelToPanel(this.TheElement,Text,XOffset,YPosition);
	
	return(Label);
}
/*
* Adds a paragraph of text to the dialog.
* @public
* @param Text - text that appears in the paragraph
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Width - width of the paragraph
* @param Height - height of the paragraph
* buttons.
*/
CMDialog.prototype.AddParagraph=function(Text,XOffset,YPosition,Width,Height)
{	
	var TheControl=CMDialog.AddParagraphToPanel(this.TheElement,Text,XOffset,YPosition,Width,Height);
	
	return(TheControl);
}
/*
* Creates a color control that displays a color picker
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - Initial value
* buttons.
*/
CMDialog.prototype.AddColorControl=function(Label,XOffset,YPosition,Value)
{
	var PenColorControl=CMDialog.AddColorControlToPanel(this.TheElement,Label,XOffset,YPosition,Value);
	
	return(PenColorControl);
}
/*
* Creates a button with text in it.
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* buttons.
*/
CMDialog.prototype.AddButtonControl=function(Text,XOffset,YPosition)
{
	var OKButton=CMDialog.AddButtonControlToPanel(this.TheElement,Text,XOffset,YPosition);
	
	return(OKButton);
}
/*
* Function to create a slider control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Min - minimum value for the contorl (i.e. left side)
* @param Max - maximum value for the control (i.e. right side)
* @param Value - initial value for the control
* buttons.
*/
CMDialog.prototype.AddSliderControl=function(Text,XOffset,YPosition,Min,Max,Value)
{
	var SliderControl=CMDialog.AddSliderControlToPanel(this.TheElement,Text,XOffset,YPosition,Min,Max,Value);

	return(SliderControl);
}
/*
* Function to create a check box control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - true or false initial state of the checkbox
* buttons.
*/
CMDialog.prototype.AddCheckBoxControl=function(Text,XOffset,YPosition,Value)
{
	// add the checkbox
	
	var TheControl=CMDialog.AddCheckBoxControlToPanel(this.TheElement,XOffset,YPosition,Value);
	
	return(TheControl);
}
/*
* Function to create a text edit control
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Value - initial contents of the control
* buttons.
*/
CMDialog.prototype.AddTextControl=function(Text,XOffset,YPosition,Value)
{
	var TheControl=CMDialog.AddTextControlToPanel(this.TheElement,Text,XOffset,YPosition,Value)
	
	return(TheControl);
}
/*
* Function to create a group of radio buttons.
*
* To determine which buttons is pressed, you will need to go through the returned array
* and see which value is "checked" (i.e. Result[i].checked=true).
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.prototype.AddRadioControl=function(Name,XOffset,YPosition,Values,Selected)
{
	var Result=CMDialog.AddRadioControlToPanel(this.TheElement,Name,XOffset,YPosition,Values,Selected)

	return(Result);
}
/*
* Function to create a select (popup menu) control
*
* @public
* @param Name - the name of the control
* @param XOffset - X Position of the control in the dialog
* @param YPostion - Y Position of the control in the dialog
* @param Values - array of values for the radio buttons.  These will be the names of the
* buttons.
* @param Selected - the selected value from values or "null" for none
*/
CMDialog.prototype.AddSelectControl=function(Name,XOffset,YPosition,Values,Selected)
{
	var TheControl=CMDialog.AddSelectControlToPanel(this.TheElement,Name,XOffset,YPosition,Values,Selected);
	
	return(TheControl);
}
//******************************************************************
// Public Static functions
//******************************************************************
/**
* Returns the value from a color control and a transparency control as an RGBA HTML color
* @public
* @param FillColorControl - the color control
* @param FillTransparencyControl - the slider control for transparency
*/
CMDialog.GetRGBAFromControls=function(FillColorControl,FillTransparencyControl)
{
	var Transparency=FillTransparencyControl.value;
	var Color=FillColorControl.value;
	
	var Colors=CMUtilities.GetRGBFromHex(Color);
	
	var RGBA=Colors.Red+","+Colors.Green+","+Colors.Blue;
	
	if (Transparency!=100)
	{
		Transparency=Transparency/100;
		RGBA="rgba("+RGBA+","+Transparency+")";;
	}
	else
	{
		RGBA="rgb("+RGBA+")";;
	}
	
	return(RGBA);
}

//CanvasMap/js/CMDialogSettings.js
/*
* CMDialogSettings
* This provides a default settings window with the based vector drawing settings
* @override
* @public
* @module CMDialogSettings
* @Copyright HSU, Jim Graham, 2019
*/
CMDialogSettings=function()
{
}
CMDialogSettings.SetStyle=function(TheLayer,Property,Key,Value)
{
	var TheStyle=TheLayer.GetProperty(Property,null);
	
	if (TheStyle==null) TheStyle={};
	
	TheStyle[Key]=Value;
	
	TheLayer.SetProperty(Property,TheStyle);
	
	TheLayer.GetScene().Repaint();
}
/**
* Pen (stroke) settings
*/
CMDialogSettings.AddPenPanel=function(TheDialog,TheLayer,Property)
{
	var YPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document

	//*************************************************************************
	
	var XPosition=0;
	
	var TheStyle=TheLayer.GetProperty(Property,null);
	
	//  add the pen color 
	
	var strokeStyle=null;
	if (TheStyle!=null) strokeStyle=TheStyle.strokeStyle;
	
	var PenColorControl=CMDialog.AddColorControlToPanel(ThePanel,"Pen Color:",XPosition,YPosition,strokeStyle);
	PenColorControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(PenColorControl).change(function() 
	{
		CMDialogSettings.SetStyle(TheLayer,Property,"strokeStyle",this.value);
	});

	YPosition+=40;

	//  add the line cap control
	
	var Values=["None",'butt','round','square'];
	
	var lineCap="None";
	if (TheStyle!=null) lineCap=TheStyle.lineCap;
	
	var LineCapControl=CMDialog.AddSelectControlToPanel(ThePanel,"Cap:",XPosition,YPosition,Values,lineCap);
	LineCapControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LineCapControl).change(function() 
	{
		var lineCap=this.value;
		if (lineCap=="None") lineCap=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"lineCap",this.value);
	});

	YPosition+=40;

	//  add the line join control
	
	var Values=["None",'bevel','round','miter'];
	
	var lineJoin="None";
	if (TheStyle!=null) lineJoin=TheStyle.lineJoin;
	
	var LineJoinControl=CMDialog.AddSelectControlToPanel(ThePanel,"Join:",XPosition,YPosition,Values,lineJoin);
	LineJoinControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LineJoinControl).change(function() 
	{
		var lineJoin=this.value;
		if (lineJoin=="None") lineJoin=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"lineJoin",lineJoin);
	});

	YPosition+=40;

	//  add the line width control
	
	var miterLimit=null;
	if (TheStyle!=null) miterLimit=TheStyle.miterLimit;
	
	var MiterLimitControl=CMDialog.AddTextControlToPanel(ThePanel,"Miter Limit:",XPosition,YPosition,miterLimit);
	MiterLimitControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(MiterLimitControl).change(function() 
	{
		if (this.value=="") this.value=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"miterLimit",this.value);
	});

	YPosition+=40;

	//  add the line width control
	
	var lineWidth=null;
	if (TheStyle!=null) lineWidth=TheStyle.lineWidth;
	
	var LineWidthControl=CMDialog.AddTextControlToPanel(ThePanel,"Width:",XPosition,YPosition,lineWidth);
	LineWidthControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LineWidthControl).change(function() 
	{
		if (this.value=="") this.value=undefined;
		CMDialogSettings.SetStyle(TheLayer,Property,"lineWidth",this.value);
	});

	YPosition+=50;

	// add the fill style
	
	var fillStyle=null;
	if (TheStyle!=null) fillStyle=TheStyle.fillStyle;
	
	var FillColorControl=CMDialog.AddColorControlToPanel(ThePanel,"Fill Color:",XPosition,YPosition,fillStyle);
	FillColorControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FillColorControl).change(function() 
	{
		var RGBAColor=CMDialog.GetRGBAFromControls(this,this.FillTransparencyControl);
		
		CMDialogSettings.SetStyle(this.TheLayer,Property,"fillStyle",RGBAColor);
	});

	YPosition+=40;

	//  add the fill color  transparency control
	
	var Transparency=100;
	if (TheStyle!=null)
	{
		var fillStyle=TheStyle.fillStyle;
		var Result=CMUtilities.GetRGBAValuesFromRGBA(fillStyle);
		Transparency=Result.Transparency*100.0;
	}
	var FillTransparencyControl=CMDialog.AddSliderControlToPanel(ThePanel,"Transparency:",XPosition,YPosition,0,100,Transparency);
	FillTransparencyControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FillTransparencyControl).change(function() 
	{
		var RGBAColor=CMDialog.GetRGBAFromControls(this.FillColorControl,this);
		
		CMDialogSettings.SetStyle(this.TheLayer,Property,"fillStyle",RGBAColor);
	});
	// cross-link the controls so their event handlers can access them
	FillTransparencyControl.FillColorControl=FillColorControl;
	FillColorControl.FillTransparencyControl=FillTransparencyControl;

	YPosition+=40;

	// the two fill controls must be able to see each other
	
	FillColorControl.FillTransparencyControl=FillTransparencyControl;
	FillTransparencyControl.FillColorControl=FillColorControl;
	
	//****************************************************************************************
	// Shadow settings
	// Shadows cause major performance problems so they are off for now
	
	XPosition=270;
	YPosition=10;
	
	var TheLineHeading=CMDialog.AddLabelToPanel(ThePanel,"Shadow Settings:",XPosition,YPosition);
	TheLineHeading.style.fontSize="18px";
	
	YPosition+=40;
	
	// Shadow color
	var shadowColor=null;
	if (TheStyle!=null) shadowColor=TheStyle.shadowColor;
	
	var ShadowColorControl=CMDialog.AddColorControlToPanel(ThePanel,"Color:",XPosition,YPosition,shadowColor);
	ShadowColorControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowColorControl).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowColor",this.value);
	});

	YPosition+=40;

	//  shadow blur
	var shadowBlur=0;
	if (TheStyle!=null) shadowBlur=TheStyle.shadowBlur;
	
	var ShadowBlurControl=CMDialog.AddTextControlToPanel(ThePanel,"Blur:",XPosition,YPosition,shadowBlur);
	ShadowBlurControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowBlurControl).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowBlur",this.value);
	});

	YPosition+=40;

	//  shadow x offset
	
	var shadowOffsetX=0;
	if (TheStyle!=null) shadowOffsetX=TheStyle.shadowOffsetX;
	
	var ShadowOffsetX=CMDialog.AddTextControlToPanel(ThePanel,"X Offset:",XPosition,YPosition,shadowOffsetX);
	ShadowOffsetX.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowOffsetX).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowOffsetX",this.value);
	});

	YPosition+=40;

	// shadow y offset
	
	var shadowOffsetY=0;
	if (TheStyle!=null) shadowOffsetY=TheStyle.shadowOffsetY;
	
	var ShadowOffsetY=CMDialog.AddTextControlToPanel(ThePanel,"Y Offset:",XPosition,YPosition,shadowOffsetY);
	ShadowOffsetY.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(ShadowOffsetY).change(function() 
	{
		CMDialogSettings.SetStyle(this.TheLayer,Property,"shadowOffsetY",this.value);
	});

	return(ThePanel);
};
//********************************************************************************************
/**
* General Settings
*/
CMDialogSettings.AddGeneralPanel=function(TheDialog,TheLayer,Property)
{
	var YPosition=10;
	var XPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document
	
	//****************************************************************************************
	//  add the global color  transparency control

	var TheStyle=TheLayer.GetProperty(Property,null);
	
	var Transparency=100;
	if (TheStyle!=null)
	{
		var globalAlpha=TheStyle.globalAlpha;
		Transparency=globalAlpha*100.0;
	}
	var GlobalAlphaControl=CMDialog.AddSliderControlToPanel(ThePanel,"Global Opacity:",XPosition,YPosition,0,100,Transparency);
	GlobalAlphaControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(GlobalAlphaControl).change(function() 
	{
		var Transparency=GlobalAlphaControl.value/100;
		if (Transparency>1) Transparency=1;
		if (Transparency<0) Transparency=0;
		
		CMDialogSettings.SetStyle(TheLayer,Property,"globalAlpha",Transparency);
	});

	// ***********************************************************************
	// add the attribute info
	
	YPosition+=40;
	
	var InfoAttribute=TheLayer.GetPropertyAttribute(CMLayer.INFO);
	
	var Headings=TheLayer.GetDataset().GetAttributeHeadings();
	
	var InfoAttributeControl=CMDialog.AddSelectControlToPanel(ThePanel,"Attribute:",XPosition,YPosition,Headings,InfoAttribute);
	
	InfoAttributeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(InfoAttributeControl).change(function() 
	{
		var InfoAttribute=InfoAttributeControl.value;
		this.TheLayer.SetPropertyAttribute(CMLayer.INFO,InfoAttribute);
		this.TheLayer.GetScene().Repaint();
	});
	
	return(ThePanel);
};
//********************************************************************************************
/**
* Label Settings
*/
CMDialogSettings.Fonts=["Arial","Verdana","Times New Roman","Courier New","serif","sans-serif"];
CMDialogSettings.FontWeights=["normal","bold","bolder","lighter"];

CMDialogSettings.LabelDirectionStrings=["Top Left","Top","Top Right","Right","Bottom Right","Bottom","Bottom Left","Left"];

CMDialogSettings.AddFontPanel=function(TheDialog,TheLayer)
{
	var XPosition=10;
	var YPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document

	var TheFontString=TheLayer.GetProperty(CMLayer.LABEL_FONT,null);
	
	//****************************************************************************************
	//  add the global color  transparency control
	
	var FontSize="40";
	var FontFamily="Arial";
	var FontWeight="normal";
	var FontItalic=false;
	
	// setup the variables
	
	if (TheFontString!=null)
	{
		var Index=TheFontString.indexOf("px");
		if (Index!=-1)
		{
			var Temp=TheFontString.substring(0,Index);
			var Index2=Temp.lastIndexOf(" ");
			if (Index2!=-1) Temp=Temp.substring(Index2+1);
			FontSize=parseInt(Temp);
		}
		for (var i=0;i<CMDialogSettings.Fonts.length;i++)
		{
			if (TheFontString.indexOf(CMDialogSettings.Fonts[i])!=-1) FontFamily=CMDialogSettings.Fonts[i];
		}
		for (var i=0;i<CMDialogSettings.FontWeights.length;i++)
		{
			if (TheFontString.indexOf(CMDialogSettings.FontWeights[i])!=-1) FontWeight=CMDialogSettings.FontWeights[i];
		}
		
		if (TheFontString.indexOf("italic")!=-1) FontItalic=true;
	}
	//*******************************************
	
	var FontControl=CMDialog.AddSelectControlToPanel(ThePanel,"Font Family:",XPosition,YPosition,CMDialogSettings.Fonts,FontFamily);
	FontControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FontControl).change(function() 
	{
		CMDialogSettings.SetFont(this.Controls,this.TheLayer);
	});
	//
	
	YPosition+=40;
	
	var FontWeightControl=CMDialog.AddSelectControlToPanel(ThePanel,"Font Weight:",XPosition,YPosition,CMDialogSettings.FontWeights,FontWeight);
	FontWeightControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FontWeightControl).change(function() 
	{
		CMDialogSettings.SetFont(this.Controls,this.TheLayer);
	});

	//  font size
	
	YPosition+=40;
	
	var FontSizeControl=CMDialog.AddTextControlToPanel(ThePanel,"Font Size:",XPosition,YPosition,FontSize);
	FontSizeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(FontSizeControl).change(function() 
	{
		CMDialogSettings.SetFont(this.Controls,this.TheLayer);
	});

	YPosition+=40;
	
	//*********************************************************************************************
	// cross link the font controls so the event handlers can access all the font values
	
	var Controls={
		FontControl:FontControl,
		FontWeightControl:FontWeightControl,
		FontSizeControl:FontSizeControl
	};
	FontControl.Controls=Controls;
	FontWeightControl.Controls=Controls;
	FontSizeControl.Controls=Controls;
	
	//*********************************************************************************************
	// cross link the controls
	//  font size
	
	LabelDirection="TR";
	
	var LabelPosition=TheLayer.GetProperty(CMLayer.LABEL_POSITION);
	if (LabelPosition!=null)
	{
		LabelDirection=LabelPosition.Direction;
	}
	var Index=CMLayer.LABEL_DIRECTIONS.indexOf(LabelDirection);
	LabelDirectionString=CMDialogSettings.LabelDirectionStrings[Index];
	var LabelPositionControl=CMDialog.AddSelectControlToPanel(ThePanel,"Direction:",XPosition,YPosition,
		CMDialogSettings.LabelDirectionStrings,LabelDirectionString);
	LabelPositionControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LabelPositionControl).change(function() 
	{
		var SelectedDirection=LabelPositionControl.selectedIndex;
		var LabelPosition=this.TheLayer.GetProperty(CMLayer.LABEL_POSITION);
		LabelPosition.Direction=CMLayer.LABEL_DIRECTIONS[SelectedDirection];
		this.TheLayer.SetProperty(CMLayer.LABEL_POSITION,LabelPosition);
		this.TheLayer.GetScene().Repaint();
	});

	YPosition+=40;
	
	// position x offset
	
	var LabelOffsetX=10;
	if (LabelPosition!=null)
	{
		LabelOffsetX=LabelPosition.OffsetX;
	}
	var OffsetXControl=CMDialog.AddTextControlToPanel(ThePanel,"X Offset:",XPosition,YPosition,LabelOffsetX);
	OffsetXControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(OffsetXControl).change(function() 
	{
		var LabelPosition=this.TheLayer.GetProperty(CMLayer.LABEL_POSITION);
		LabelPosition.OffsetX=parseInt(OffsetXControl.value);
		this.TheLayer.SetProperty(CMLayer.LABEL_POSITION,LabelPosition);
		this.TheLayer.GetScene().Repaint();
	});
	YPosition+=40;
	
	// position y offset
	
	var LabelOffsetY=10;
	if (LabelPosition!=null)
	{
		LabelOffsetY=LabelPosition.OffsetY;
	}
	var OffsetYControl=CMDialog.AddTextControlToPanel(ThePanel,"Y Offset:",XPosition,YPosition,LabelOffsetY);
	OffsetYControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(OffsetYControl).change(function() 
	{
		var LabelPosition=this.TheLayer.GetProperty(CMLayer.LABEL_POSITION);
		LabelPosition.OffsetY=parseInt(OffsetYControl.value);
		this.TheLayer.SetProperty(CMLayer.LABEL_POSITION,LabelPosition);
		this.TheLayer.GetScene().Repaint();
	});

	// ***********************************************************************
	// right side of the panel
	
	var XPosition=300;
	var YPosition=10;
	
	var LabelAttribute=TheLayer.GetPropertyAttribute(CMLayer.LABEL);
	
	var Headings=TheLayer.GetDataset().GetAttributeHeadings();
	
	var LabelPositionControl=CMDialog.AddSelectControlToPanel(ThePanel,"Attribute:",XPosition,YPosition,Headings,LabelAttribute);
	
	LabelPositionControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(LabelPositionControl).change(function() 
	{
		var LabelAttribute=LabelPositionControl.value;
		this.TheLayer.SetPropertyAttribute(CMLayer.LABEL,LabelAttribute);
		this.TheLayer.GetScene().Repaint();
	});
	
	return(ThePanel);
};
/**
*
*/
CMDialogSettings.MarkTypes=["Circle","Triangle","Square","Star"];

CMDialogSettings.AddMarkPanel=function(TheDialog,TheLayer)
{
	var XPosition=10;
	var YPosition=10;
	
	// create the panel
	var ThePanel=document.createElement("div");
	
	TheDialog.TheElement.appendChild(ThePanel); // add the dialog element to the document

	//*********************************************************************************************
	// cross link the controls
	//  font size
	
	var MarkType=TheLayer.GetProperty(CMLayer.MARK_TYPE);
	
	var MarkTypeControl=CMDialog.AddSelectControlToPanel(ThePanel,"Mark Type:",XPosition,YPosition,
		CMDialogSettings.MarkTypes,CMDialogSettings.MarkTypes[MarkType]);
	
	MarkTypeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(MarkTypeControl).change(function() 
	{
		var SelectedIndex=this.selectedIndex;
		
		// the mark types are numbered from 0 so we can juse use the selected index as the mark type
		this.TheLayer.SetProperty(CMLayer.MARK_TYPE,SelectedIndex);
		this.TheLayer.GetScene().Repaint();
	});

	YPosition+=40;
	
	// position x offset
	
	var MarkSize=TheLayer.GetProperty(CMLayer.MARK_SIZE);
	
	var MarkSizeControl=CMDialog.AddTextControlToPanel(ThePanel,"Mark Size:",XPosition,YPosition,MarkSize);
	MarkSizeControl.TheLayer=TheLayer; // set the current layer so the functions can access it
	$(MarkSizeControl).change(function() 
	{
		var MarkSize=parseInt(this.value);
		this.TheLayer.SetProperty(CMLayer.MARK_SIZE,MarkSize);
		this.TheLayer.GetScene().Repaint();
	});
	
	return(ThePanel);
};

/**
* Sets the font into the layers styles
*/
CMDialogSettings.SetFont=function(TheControls,TheLayer)
{
	var Font=TheControls.FontControl.value;
	var FontSize=TheControls.FontSizeControl.value;
	var FontWeight=TheControls.FontWeightControl.value;
	
	var FontString=FontWeight+" "+FontSize+"px "+Font;
	
	TheLayer.SetProperty(CMLayer.LABEL_FONT,FontString);
	TheLayer.GetScene().Repaint();
}
/**
* Utility function to hide all the panels used to make it easier to make one panel
* visible and to hide all the panels on exit
*/
CMDialogSettings.HidePanels=function(TheDialog) 
{
	for (var i=0;i<TheDialog.Panels.length;i++)
	{
		TheDialog.Panels[i].style.visibility="hidden";
		TheDialog.Tabs[i].className="CM_SettingsDialogTab";
	}
};
/**
* Add a tab to the dialog
*/
CMDialogSettings.AddTab=function(TheOrderedList,TheDialog,Name,XPosition,YPosition,Width,Height,TargetPanel)
{
	var TheListItem=document.createElement("LI");
	TheListItem.className="CM_SettingsDialogTab";
	
	TheOrderedList.appendChild(TheListItem);

	var textnode=document.createTextNode(Name);
	TheListItem.appendChild(textnode);
	
	TheListItem.TargetPanel=TargetPanel;
	TheListItem.TargetTab=TheListItem;
	TheListItem.TheDialog=TheDialog;
	
	TheListItem.addEventListener("click", function()
	{
		CMDialogSettings.HidePanels(this.TheDialog);
		this.TargetTab.className="CM_SettingsDialogTab_Selected";
		this.TargetPanel.style.visibility="visible";
	});
	return(TheListItem);
}
//********************************************************************************************
/**
* Main entry point to display the settings dialog to the user
*/
CMDialogSettings.ShowSettingsDialog=function(TheLayer) 
{
	var YPosition=10;
	var XPosition=10;
	
	// get the dialog, create it if needed
	
	var TheDialog=new CMDialog("LayerVector_Settings_Dialog",600,400); // dialog width and height
	
	TheDialog.SuperClass_SetVisible=TheDialog.SetVisible; // does not call function, just moves a reference to it
	
	TheDialog.SetVisible=function(Flag)
	{
		this.SuperClass_SetVisible(Flag);
		
		if (Flag===false)
		{
			CMDialogSettings.HidePanels(this);
		}
	}
	
	if (TheLayer.TheStyle==null) TheLayer.TheStyle={};
	
	// add the ordered list for the tabs at the top
	var TheOrderedList=document.createElement("UL");
	TheDialog.TheElement.appendChild(TheOrderedList);
	
	// setup the panels
	
	var GeneralPanel=CMDialogSettings.AddGeneralPanel(TheDialog,TheLayer,CMLayer.FEATURE_STYLE);
	GeneralPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(GeneralPanel,10,40,500,500);

	var PenPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.FEATURE_STYLE);
	PenPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(PenPanel,10,40,500,500);
	
	var LabelPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.LABEL_STYLE);
	LabelPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(LabelPanel,10,40,500,500);
	
	var FontPanel=CMDialogSettings.AddFontPanel(TheDialog,TheLayer);
	FontPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(FontPanel,10,40,500,500);
	
	var MarkPanel=CMDialogSettings.AddMarkPanel(TheDialog,TheLayer);
	MarkPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(MarkPanel,10,40,500,500);
	
	var MouseOverPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.MOUSE_OVER_STYLE);
	MouseOverPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(MouseOverPanel,10,40,500,500);
	
	var SelectedPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.SELECTED_STYLE);
	SelectedPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(SelectedPanel,10,40,500,500);
	
	// add the panels to the dialog for access later
	
	TheDialog.Panels=[];
	TheDialog.Tabs=[];
	
	TheDialog.Panels.push(GeneralPanel);
	TheDialog.Panels.push(PenPanel);
	TheDialog.Panels.push(LabelPanel);
	TheDialog.Panels.push(FontPanel);
	TheDialog.Panels.push(MarkPanel);
	TheDialog.Panels.push(MouseOverPanel);
	TheDialog.Panels.push(SelectedPanel);

	// setup the tab buttons
	var TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"General",XPosition,YPosition,100,30,GeneralPanel);
	TheDialog.Tabs.push(TheTab);
	
	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Feature",XPosition,YPosition,100,30,PenPanel);
	TheDialog.Tabs.push(TheTab);
	
	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Labels",XPosition,YPosition,100,30,LabelPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Font",XPosition,YPosition,100,30,FontPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Marks",XPosition,YPosition,100,30,MarkPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Mouse",XPosition,YPosition,100,30,MouseOverPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Selected",XPosition,YPosition,100,30,SelectedPanel);
	TheDialog.Tabs.push(TheTab);

	// make the first panel visible
	CMDialogSettings.HidePanels(TheDialog);
	TheDialog.Panels[0].style.visibility="visible";
	

	return(TheDialog);
};
/**
* Main entry point to display the settings dialog to the user
*/
CMDialogSettings.ShowSettingsDialogForStyle=function(TheStyle) 
{
	var YPosition=10;
	var XPosition=10;
	
	// get the dialog, create it if needed
	
	var TheDialog=new CMDialog("LayerVector_Settings_Dialog",600,400); // dialog width and height
	
	TheDialog.SuperClass_SetVisible=TheDialog.SetVisible; // does not call function, just moves a reference to it
	
	TheDialog.SetVisible=function(Flag)
	{
		this.SuperClass_SetVisible(Flag);
		
		if (Flag===false)
		{
			CMDialogSettings.HidePanels(this);
		}
	}
	
	if (TheStyle==null) TheStyle={};
	
	// add the ordered list for the tabs at the top
	var TheOrderedList=document.createElement("UL");
	TheDialog.TheElement.appendChild(TheOrderedList);
	
	// setup the panels
	
	var LabelPanel=CMDialogSettings.AddPenPanel(TheDialog,TheLayer,CMLayer.LABEL_STYLE);
	LabelPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(LabelPanel,10,40,500,500);
	
	var FontPanel=CMDialogSettings.AddFontPanel(TheDialog,TheLayer);
	FontPanel.className="CM_SettingsPanel";
	CMUtilities.AbsolutePosition(FontPanel,10,40,500,500);
	
	// add the panels to the dialog for access later
	
	TheDialog.Panels=[];
	TheDialog.Tabs=[];
	
	TheDialog.Panels.push(LabelPanel);
	TheDialog.Panels.push(FontPanel);

	// setup the tab buttons
	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Labels",XPosition,YPosition,100,30,LabelPanel);
	TheDialog.Tabs.push(TheTab);

	TheTab=CMDialogSettings.AddTab(TheOrderedList,TheDialog,"Font",XPosition,YPosition,100,30,FontPanel);
	TheDialog.Tabs.push(TheTab);

	// make the first panel visible
	CMDialogSettings.HidePanels(TheDialog);
	TheDialog.Panels[0].style.visibility="visible";

	return(TheDialog);
};
//CanvasMap/js/CMItem.js
/******************************************************************************************************************
* CMItem
* An item is something that is displayed and typically can be edited
* by a user.  Items includeobjects such as arrows, boxes, labels, and ovals.
* A CMLayer (geospatial layer) is a subclass of this class.
*
* Adds:
* - Tweening
* - Styles, Painting
* - Visilbity
*
* @module CMDatasetPyramidOpenFormat
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Definitions
//******************************************************************
 
CMItem.STATUS_HIDDEN=0;
CMItem.STATUS_VISIBLE=1;
CMItem.STATUS_SELECTABLE=2;
CMItem.STATUS_EDITABLE=3;
CMItem.StatusNames=["Hidden","Visible","Selectable","Editable"]; // jjg - need to resolve ints versus names for enumberated settings

/**
* Below are the settings definitions.
* @public, @settings
*/
CMItem.SettingDefintions=
{
	Item:
	{
		Name: { Name:"Name",Type:CMBase.DATA_TYPE_STRING, Default:"" }, // Name that appears in the item and layer lists
		
		Status: { Name:"Status",Type:CMBase.DATA_TYPE_ENUMERATED, Options:[CMItem.STATUS_HIDDEN,CMItem.STATUS_VISIBLE,CMItem.STATUS_SELECTABLE,CMItem.STATUS_EDITABLE],Default:CMItem.STATUS_SELECTABLE },// How the item appears to the user and how the user can interact with it
		
		// jjg - should this be in the view?
		PixelTolerance: { Name:"Pixel Tolerance",Type:CMBase.DATA_TYPE_FLOAT, Default:6 }, // distance from a point or polyline the user needs to click to select it.
		PositionOffset: { Name:"Position Offset Vector",Type:CMBase.DATA_TYPE_VECTOR, Default:null }, // x,y, and z values to offset the item
		Rotation: { Name:"Rotation Vector",Type:CMBase.DATA_TYPE_VECTOR, Default:null }, // pitch, roll, and yaw values (x,y,z) values to roatate the item in degrees
		Scale: { Name:"Scaling Vector",Type:CMBase.DATA_TYPE_VECTOR, Default:null }, // x,y, and z scaling values for the item's size
	},
	Style:
	{
		// standard HTML 5 settings except the defaults may change and sometimes the available settings will change between each settings group
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" }, // Style to draw lines (HTML Canvas)
		lineWidth: { Name:"Line Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 }, // Pixel width of lines (HTML Canvas)
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["butt","round","square"],Default:"round" },// How to end lines (HTML Canvas)
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["bevel","round","miter"],Default:"round" }, // How to round line connections (HTML Canvas)
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" }, // How to fill polygons (HTML Canvas)
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" }, // Color for shadows (HTML Canvas)
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }, // Pixels distance to blur the shadow (HTML Canvas)
		shadowOffsetX: { Name:"Shadow X",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }, // Horizontal pixel distance to move shadow (HTML Canvas)
		shadowOffsetY: { Name:"Shadow Y",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }, // Vertical pixel distance to move shadow (HTML Canvas)
		
		PatternImage: { Name:"Pattern Images",Type:CMBase.DATA_TYPE_IMAGE, Default:null }, // Replaces the fill style with an image (HTML Canvas)
		GradientType: { Name:"Gradient Type",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["Linear","Radial"],Default:"Radial" }, // Type of gradient fill, requires coordinates and colors (HTML Canvas)
		GradientCoordinates: { Name:"Gradient Coordinates",Type:CMBase.DATA_TYPE_COORDINATES, Default:null }, // Pixel coordinates for the gradient (HTML Canvas)
		GradientRadius1: { Name:"Gradient Radius 1",Type:CMBase.DATA_TYPE_FLOAT, Default:0 }, // Pixel radius for radia gradient (HTML Canvas)
		GradientRadius2: { Name:"Gradient Radius 2",Type:CMBase.DATA_TYPE_FLOAT, Default:100 }, // Pixel radius for radia gradient (HTML Canvas)
		GradientColors: { Name:"Gradient Colors",Type:CMBase.DATA_TYPE_COLOR_ARRAY, Default:null }, // Colors for each gradient stop (HTML Canvas)
		
		globalAlpha: { Name:"Transparency",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }, // 0 for transparent, 1 for opaque, between for translucent (HTML Canvas)
		globalCompositeOperation: { Name:"Composite Operation",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["source-over","source-atop","source-in","source-out","destination-over","destination-atop","destination-in","destination-out","lighter","copy","xor"],Default:"source-over" }, // Determines how items are drawn on top of one another (HTML Canvas)
	},
	Text:
	{
		Text: { Name:"Text",Type:CMBase.DATA_TYPE_STRING, Default:null }, // text that will appear in the item
		Visible: { Name:"Text Visible",Type:CMBase.DATA_TYPE_BOOLEAN, Default:true }, // true to make theitem visible, false for hidden
//		DimensionsInPixels: { Name:"Dimensions in Pixel Units",Type:CMBase.DATA_TYPE_BOOLEAN, Default:true }, // true to have the font size and other dimensions be in pixel units, false for map-reference units
		
		font: { Name:"Font",Type:CMBase.DATA_TYPE_FONT, Default:"12px Arial" }, // CSS font metrics for the text (all are optional but order is required to be: "style variant weight size family" (e.g. "italic small-caps bold 12px arial")
		
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" }, // color for the outline of the characters
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 }, // width of the outline of the characters
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["butt","round","square"],Default:"round" }, // jjg - text does not have open line endings so remove this?
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["bevel","round","miter"],Default:"round" }, // how the line segments in the outlines of the characters join together
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" }, // fill color for the characters
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		
		globalAlpha: { Name:"Transparency",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }, // 0 for transparent, 1 for opaque, between for translucent (HTML Canvas)
		globalCompositeOperation: { Name:"Composite Operation",Type:CMBase.DATA_TYPE_ENUMERATED, Options:["source-over","source-atop","source-in","source-out","destination-over","destination-atop","destination-in","destination-out","lighter","copy","xor"],Default:"source-over" }, // Determines how items are drawn on top of one another (HTML Canvas)
	},
};
CMItem.UniqueNumber=0;

CMItem.MESSAGE_CONTENT_CHANGED=CMBase.GetUniqueNumber();

//******************************************************************
// Constructor
//******************************************************************
/**
* Creates a new CMItem object.  This is an abstract class.
* @protected, @constructs
*/
function CMItem() 
{
	CMBase.call(this);
	
	// Properties
	this.UniqueNumber=CMItem.UniqueNumber;
	
	// CMBase does not have settings so this is the main property for settings
	this.TimeSlices=[
	{
	 	UniqueNumber:CMItem.UniqueNumber,
		Time:0,
		Settings:
		{
			Style:
			{
				strokeStyle:"rgb(0,0,0)",
				lineWidth:1,
				fillStyle:"rgb(255,255,255)"
			},
			Text:
			{
			},
		}
	}];
	
	CMItem.UniqueNumber++;
	 
	this.LastStyle=null;
	this.LastTimeSlice=0;
}
CMItem.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMItem.prototype.contructor=CMItem; // override the constructor to go to ours

//******************************************************************
// CMBase Settings Functions
//******************************************************************
/**
* Called when any settings are changed.
* @protected
*/
CMItem.prototype.SettingsChanged=function() 
{
	this.LastStyle=null; // force style to be recomputed
	
	this.Repaint();
}
/**
* Called to get the settings definitions. Subclasses should override to add their own settings groups.
* @protected, @override
*/

CMItem.prototype.GetSettingsDefinitions=function() 
{
	var Result={};
	
	for (Key in CMItem.SettingDefintions)
	{
		Result[Key]=CMItem.SettingDefintions[Key];
	}

	return(Result); 
}
/**
* Get a set of settings.  The TimeSlice must already exist within the object.
* This adds the TimeSlice parameter to the overriden CMBase.SetSettings() function.
* @public
* @param TimeSlice - optional value to set a property to transition at a specific time.
* @returns Settings - current settings object
*/
CMItem.prototype.GetSettings=function(TimeSlice) 
{
	var Result=null;
	
	var TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		Result=this.TimeSlices[TimeSliceIndex].Settings;
	}
	return(Result);
}
/**
* Sets a set of settings for this object.  The TimeSlice must already exist within the object.
* This adds the TimeSlice parameter to the overriden CMBase.SetSettings() function.
* @public
* @param NewSettings - The settings to replace the existing settings.
* @param TimeSlice - Which time slice to set
*/
CMItem.prototype.SetSettings=function(NewSettings,TimeSlice) 
{
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		var TheSettings=this.TimeSlices[TimeSliceIndex].Settings;
		
		for (var GroupKey in NewSettings) // for each group the user is try to set settings for
		{
			var GroupSettings=this.GetGroupFromSettings(GroupKey,TheSettings);
			
			// at this point we have a GroupSettings object or have generated an error
			var NewGroup=NewSettings[GroupKey];
			
			for (var SettingKey in NewGroup)
			{
				TheSettings[GroupKey][SettingKey]=NewGroup[SettingKey];
			}
		}
	}
	this.SettingsChanged();
}

/**
* Sets an individual setting value into the settings.  The only change from the CMBsae function is the addition of the TimeSlice parameter.
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - value for the type (see the documentation for types for each of the properties)
*/
CMItem.prototype.SetSetting=function(GroupKey,SettingKey,Value,TimeSlice)
{
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		// try to get the group of definitions that match the GroupKey
		var SettingsDefinitions=this.GetSettingsDefinitions();
		
		var GroupDefinitions=SettingsDefinitions[GroupKey];
		
		if (GroupDefinitions!=undefined) // group is in the group definitions
		{
			if (SettingKey in GroupDefinitions)  // check if the key is in the definitions
			{
				var TheSettings=this.TimeSlices[TimeSliceIndex].Settings;
		
				if (TheSettings[GroupKey]==undefined) TheSettings[GroupKey]={};
				
				TheSettings[GroupKey][SettingKey]=Value; // add the new value
				
				this.SettingsChanged();
			}
			else this.SettingsError(GroupKey,SettingKey);
		}
		else this.SettingsError(GroupKey);
	}
	
	if ((GroupKey=="Item")&&(SettingKey=="Status"))
	{
		this.Repaint();
	}
			
}
/**
* Get an individual value from the settings
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - curnet property value.
*/
CMItem.prototype.GetSetting=function(Group,Key,Default,TimeSlice)
{
	var Result=null; //this.SettingDefintions[Group][Key].Default;
	
	if (Default!=undefined) Result=Default;
	
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		if (this.TimeSlices!=undefined)
		{
			// try to get the settings from the current object settings
			var GroupSettings=this.TimeSlices[TimeSliceIndex].Settings[Group];
			
			if (GroupSettings!=undefined) // group has not been defined yet
			{
				if (Key in GroupSettings) Result=GroupSettings[Key];
			}
			// if we could not find a setting value and the default was not provided, get the default from the definitions
			if (Result==null) 
			{
				var SettingsDefinitions=this.GetSettingsDefinitions();
				
				if (Group in SettingsDefinitions)
				{
					var GroupDefinitions=SettingsDefinitions[Group];
					
					if (Key in GroupDefinitions) 
					{
						Result=GroupDefinitions[Key].Default;
					}
					else this.SettingsError(Group,Key);
				}
				else this.SettingsError(Group);
			}
		}
	}
	return(Result);
}
//******************************************************************
// CMItem Settings Functions
//******************************************************************
/**
* Set a group of settings
* @public
* @param Group - Group for the setting
* @param Values - Object with groups settings
* @param TimeSlice - Optional time slice for where to insert the group
*/
CMItem.prototype.SetSettingGroup=function(Group,Values,TimeSlice)
{
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		this.TimeSlices[TimeSliceIndex].Settings[Group]=Values; // save them into the object
	}
	this.SettingsChanged();
}
/**
* Get a group of settings
* @public
* @param Group - Group for the setting
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - curnet property value.
*/
CMItem.prototype.GetSettingGroup=function(Group,Default,TimeSlice)
{
	var Result=null;
	if (Default!=undefined) Result=Default;
	
	var TimeSliceIndex=0;
	
	if (TimeSlice!=undefined) TimeSliceIndex=CMItem.FindTimeSliceIndex(this.TimeSlices,TimeSlice);
	
	if (TimeSliceIndex!=-1)
	{
		Result=this.TimeSlices[TimeSliceIndex].Settings[Group];
	}
	return(Result);
}
//******************************************************************
// Functions to select and unselect content
//******************************************************************
/**
* Subclasses should override this function to unselect any selected content
* @protected - only used within CanvasMap 
*/
CMItem.prototype.UnselectAll=function(SendMessageFlag) 
{
	if (this.Selected) // unselect this item
	{
		this.Selected=false;
		if (this.LayerInList!=undefined)
		{
			this.LayerInList.className="CM_LayerListItemClass";
		}
		
		if (SendMessageFlag) // call the scene to let everyone know the selection changed
		{
			var TheScene=this.GetParent(CMScene);
			TheScene.SelectionChanged(this);
		}
	}
}

//***********************************************************************************************
// Private Static Functions for managing time slices
//***********************************************************************************************
/**
* Finds an index to a specific time slice value
* @private
*/
CMItem.FindTimeSliceIndex=function(TimeSliceSettings,TimeSlice)
{
	var Result=-1;
	
	if (TimeSlice==undefined) // return the first entry
	{
		if (TimeSliceSettings.length>0) Result=0; // have at least one entry
	}
	else
	{
		for (var i=0;(i<TimeSliceSettings.length)&&(Result==-1);i++)
		{
			var TimeSliceSetting=TimeSliceSettings[i];
			
			if (TimeSliceSetting.Time==TimeSlice) Result=i;
		}
	}
	return(Result);
}
//***********************************************************************************************
// Protected functions for managing time slices
//***********************************************************************************************

/**
* Returns the time slices
* @protected
* @TheTimeSlices - array to add this objects time slices to
* @returns TheTimeSlices - the same array but with the time slices added.
*/
CMItem.prototype.GetTimes=function(TheTimeSlices)  
{ 
	TheTimeSlices=[];

	for (var i=0;i<this.TimeSlices.length;i++)
	{	
		var Time=this.TimeSlices[i].Time;
		
		CMUtilities.InsertIntoSortedArray(TheTimeSlices,parseFloat(Time));
	}
	return(TheTimeSlices); 
}
/**
* Adds a new time slice
* @protected
* @Time - the time to add
* @returns Index - index to the new time slice
*/
CMItem.prototype.InsertTime=function(Time)
{
	var TimeSlices=this.TimeSlices;
	
	var Index=-1;
	for (var i=0;i<TimeSlices.length;i++)
	{
		if (TimeSlices[i].Time==Time) // TimeSlice is already in the settings
		{
			Index=i; // return the index to the existing slice
		}
		else if (TimeSlices[i].Time>Time) // we are past the desired TimeSlice, insert the new one
		{
			Index=i;
			TimeSlices.splice(Index,0,Time);
		}
	}
	if (Index==-1) // missed the TimeSlice, add it at the end
	{
		Index=TimeSlices.length;
		TimeSlices.push({Settings:{},Time:Time});
	}
	if (Index!=-1) // inserted a TimeSlice at Index
	{
		var OldTimeSliceSettings=TimeSlices[Index-1].Settings;
		var NewTimeSliceSettings=TimeSlices[Index].Settings;
		
		for (ClassKey in OldTimeSliceSettings)
		{
			var TheSetting=OldTimeSliceSettings[ClassKey];
			
			TheSetting=CMUtilities.Clone(TheSetting);
			
			NewTimeSliceSettings[ClassKey]=TheSetting;
		}
	}
	this.Repaint();
	
	return(Index);
}
/**
* Removes a time slice
* @protected
* @Time - the time to delete
* @returns Index - index to the deleted time slice
*/
CMItem.prototype.DeleteTime=function(Time)
{
	var TimeSlices=this.TimeSlices;
	
	var Index=-1;
	for (var i=0;i<TimeSlices.length;i++)
	{
		if (TimeSlices[i].Time==Time) 
		{
			Index=i;
			TimeSlices.splice(Index,1); // remove the time slice
		}
	}
	this.Repaint();
	return(Index);
}
//******************************************************************
// Private Utility functions to aid with managing time slices
//******************************************************************
/**
* Get a tweened value between two values
* @private
* @param Value 1 - minimum value
* @param Value2 - maxumum value
* @param Default - default to use if neither Value1 or Value2 are defnied
* @param Factor - interpolation factor (1 for Value1, 0 for Value2, 0 to 1 is an interpolated value between the two
*/
CMItem.GetTweenFloatValue=function(Value1,Value2,Default,Factor) 
{
	var Result=Default;
	
	if (Value1!=undefined) // have value 1
	{
		if (Value2!=undefined) // also have value 2, do tweening
		{
			Result=(Value1*Factor)+(Value2*(1-Factor));
		}
		else // just have value1, use it
		{
			Result=Value1;
		}
	}
	else if (Value2!=undefined) // just have value 2, use it
	{
		Result=Value2;
	}
	return(Result);
}
/**
* Get a tweened value between two color values
* @private
* @param Value 1 - minimum value
* @param Value2 - maxumum value
* @param Default - default to use if neither Value1 or Value2 are defnied
* @param Factor - interpolation factor (1 for Value1, 0 for Value2, 0 to 1 is an interpolated value between the two
*/
CMItem.GetTweenColorValue=function(Value1,Value2,Default,Factor) 
{
	var Result=Default;
	
	var Colors=null;
	
	if (Value1!=undefined) // have value 1
	{
		var Colors1=CMUtilities.GetColorsFromAnyColor(Value1);
		
		if (Value2!=undefined) // also have value 2, do tweening
		{
			var Colors2=CMUtilities.GetColorsFromAnyColor(Value2);
			
			Colors={
				Red:Math.round((Colors1.Red*Factor)+(Colors2.Red*(1-Factor))),
				Green:Math.round((Colors1.Green*Factor)+(Colors2.Green*(1-Factor))),
				Blue:Math.round((Colors1.Blue*Factor)+(Colors2.Blue*(1-Factor)))
			}
		}
		else // just have value1, use it
		{
			Colors=Value1;
		}
	}
	else if (Value2!=undefined) // just have value 2, use it
	{
		Colors=Value2;
	}
	if (Colors!=null) Result="rgb("+Colors.Red+","+Colors.Green+","+Colors.Blue+")";
	
	return(Result);
}
/**
* Get a tweened value between two color values
*
* jjg - does not currently support gradients or patterns
*
* @private
* @param Value 1 - minimum value
* @param Value2 - maxumum value
* @param Default - default to use if neither Value1 or Value2 are defnied
* @param Factor - interpolation factor (1 for Value1, 0 for Value2, 0 to 1 is an interpolated value between the two
*/
CMItem.GetTweenStyleValue=function(Value1,Value2,Default,Factor) 
{
	var Result=CMItem.GetTweenColorValue(Value1,Value2,Default,Factor) ;

	return(Result);
}
//******************************************************************
// CMBase functions
//******************************************************************
/**
* Remove the layer at the specified index from the list of layers
* @public
* @param Index - 
*/
CMItem.prototype.CMBase_RemoveChild=CMBase.prototype.RemoveChild;

CMItem.prototype.RemoveChild=function(Index) 
{
	if (typeof(Index)!="number") Index=this.GetChildIndex(Index);
	
	var TheItem=this.GetChild(Index);
	
	// hide the item before removing it
	TheItem.SetSetting("Item","Status","CMItem.STATUS_HIDDEN");
	
	Result=this.CMBase_RemoveChild(TheItem);
	
	return(Result);
}

//******************************************************************
// Protected functions for managing time slices
//******************************************************************
/**
* Removes a time slice
* @protected
* @Time - the time to delete
* @returns Index - index to the deleted time slice
*/
CMItem.GetTimeFactor=function(TimeSliceArray)
{
	var TimeSlice1=TimeSliceArray[0].Time;
	var TimeSlice2=TimeSliceArray[1].Time;
	
	var Range=TimeSlice2-TimeSlice1;
	var Factor=(Range-TimeSlice)/Range; // 0 at end, 1 at start (jjg - Where is TimeSlice defined?)
	
	return(Factor);
}


/**
* Find the appropriate time slices for the specified TimeSlice
* @protected - used by subclasses to find the time slice settings to use
*/
CMItem.prototype.GetBoundingTimeSlices=function(TimeSlice)
{
	if (TimeSlice==undefined)
	{
		var TheScene=this.GetParent(CMScene);
	
		TimeSlice=TheScene.GetTimeRange();
	}
	// find the settings to use for the style, either Settings1 or both Settings1 and Settings2 for tweening
	
	var TheTimeSliceSetting1=null;
	var TheTimeSliceSetting2=null;
//	var TheKeys=Object.keys(this.TimeSlices);
	
	for (var i=0;(i<this.TimeSlices.length)&&(TheTimeSliceSetting1==null);i++)
	{
		// get the key and make sure it is a number
		var ThisSlicesTime=parseFloat(this.TimeSlices[i].Time);
		
		if (ThisSlicesTime==TimeSlice) // current key exactly matches the desired time slice
		{
			TheTimeSliceSetting1=this.TimeSlices[i];
		}
		else if (ThisSlicesTime>TimeSlice) // current key is after desired time slice
		{
			if (i==0) // first key is after the desired time slice, use just the first key
			{
				TheTimeSliceSetting1=this.TimeSlices[0];
			}
			else // time slice is between two keys
			{
				TheTimeSliceSetting1=this.TimeSlices[i-1];
				TheTimeSliceSetting2=this.TimeSlices[i];
			}
		}
	}
	
	// if we did not find a match and there are timeslices, the desired time slice must be after the last key
	if ((TheTimeSliceSetting1==null)&&(this.TimeSlices.length>0))
	{
		TheTimeSliceSetting1=this.TimeSlices[this.TimeSlices.length-1];
	}
	
	// return the result as an array for fast access
	var Result=[TheTimeSliceSetting1,TheTimeSliceSetting2];
	
	return(Result);
}
/**
* Returns a tweened style based on the specified TimeSlice
* @protected
*/
CMItem.prototype.GetStyle=function(TheView,TimeSlice,Group) 
{
	if (TimeSlice==undefined) TimeSlice=0;

	if (Group==undefined) Group="Style";
	
//	if ((this.LastStyle==null)||(this.LastTimeSlice!=TimeSlice))
	{
		this.LastStyle=null;
		this.LastTimeSlice=TimeSlice;
		
		var Result=this.GetBoundingTimeSlices(TimeSlice);
		var TheTimeSlice1=Result[0];
		var TheTimeSliceSetting1=TheTimeSlice1.Settings;
		var TheTimeSlice2=Result[1];

		//*********************************************************************************************************
		// create the style to return
		
		if (TheTimeSlice1!=null) // have something
		{
			var TheStyle;
			
			if (TheTimeSlice2==null) // no tweening
			{
	//			for (TheGroupKey1 in TheTimeSliceSetting1)
				{
					var TheGroup1=TheTimeSliceSetting1[Group];
					
//					var TheGroup={};
					for (TheSettingKey1 in TheGroup1)
					{
						if (TheStyle===undefined) TheStyle={};
						
						var TheSetting1=TheGroup1[TheSettingKey1];
						
						TheStyle[TheSettingKey1]=TheSetting1;
					}
				}
			}
			else // have tweening
			{
				var TheTimeSliceSetting2=TheTimeSlice2.Settings;
				
				var Factor=CMItem.GetTimeFactor(Result);
				
	//			for (TheGroupKey1 in TheTimeSliceSetting1)
				{
					var TheGroup1=TheTimeSliceSetting1[Group];
					var TheGroup2=TheTimeSliceSetting2[Group];
					
					for (TheSettingKey1 in TheGroup1)
					{
						if (TheStyle===undefined) TheStyle={};
						
						var TheSetting1=TheGroup1[TheSettingKey1];
						var TheSetting2=TheGroup2[TheSettingKey1];
						
						if ((TheSettingKey1=="strokeStyle")||(TheSettingKey1=="fillStyle")) // styles are treated specially
						{
							TheStyle[TheSettingKey1]=CMItem.GetTweenStyleValue(TheSetting1,TheSetting2,"rgb(0,0,0)",Factor);
						}
						else if (TheSettingKey1=="shadowColor") // colors have to have each element tweened
						{
							TheStyle[TheSettingKey1]=CMItem.GetTweenColorValue(TheSetting1,TheSetting2,"rgb(0,0,0)",Factor);
						}
						else // must be a number
						{
							TheStyle[TheSettingKey1]=CMItem.GetTweenFloatValue(TheSetting1,TheSetting2,0,Factor) ;
						}
					}
				}
			}
			// convert ref dimensions to pixel dimensions (jjg - add tweening)
	
			for (key in TheStyle)
			{
				// have to adjust for reference unit dimensions
				if ((key=="lineWidth")||(key=="shadowOffsetX")||(key=="shadowOffsetY")||(key=="shadowBlur"))
				{
					var Test=12;
	//				TheStyle[key]=TheView.GetPixelWidthFromRefWidth(TheStyle[key]); // jjg - need to make this an option
				}
			}
			this.LastStyle=TheStyle;
		}
	}

	return(this.LastStyle);
}
//******************************************************************
// CMItem Settings helper functions
//******************************************************************
CMItem.prototype.GetRefTolerance=function(TheView)
{
	var PixelTolerance=this.GetSetting("Item","PixelTolerance",6);
	
	var RefTolerance=TheView.GetRefWidthFromPixelWidth(PixelTolerance);
	
	return(RefTolerance);
}

//******************************************************************
// Protected functions for managing the layer list
//******************************************************************

/**
* Called by the CMPanelLayerList to add this item to the layer list
*
* For now we assume the layer is changing each time this is called.
* @protected
*/
CMItem.prototype.AddToList=function(TheElement,Left,LayerInListTop,LayerListItemHeight)
{
	//***************************************************************************
	// create the overall div tag for the layer in the list
	
	var LayerInList=null;
	
//	if (this.LayerInList==undefined)
	{
		LayerInList=document.createElement('div');
		LayerInList.className="CM_LayerListItemClass";
		TheElement.appendChild(LayerInList);
		this.LayerInList=LayerInList;
	}
//	else
//	{
//		LayerInList=this.LayerInList;
//	}
	if (this.Selected) this.LayerInList.className="CM_LayerListItemClass_Selected";

	//***************************************************************************
	// add the check box
	
	var TheCheckBox=document.createElement('input');
	TheCheckBox.className="CM_LayerListCheckBoxClass";
	
	TheCheckBox.type="checkbox"
	TheCheckBox.TheLayer=this;
	TheCheckBox.checked=this.GetVisible(); // check if the layer is currently visible
	TheCheckBox.addEventListener('click', function()
	{
		if (this.checked)
		{
			this.TheLayer.SetSetting("Item","Status",CMItem.STATUS_VISIBLE);
		}
		else // unchecked
		{
			this.TheLayer.SetSetting("Item","Status",CMItem.STATUS_HIDDEN);
		}
	});

	CMUtilities.AbsolutePosition(TheCheckBox,Left+2,-6,30,LayerListItemHeight-6);
	
	// Set the position of the check boxes
	LayerInList.appendChild(TheCheckBox);

	//***************************************************************************
	// add the icon
	
	var TheIcon=this.GetIcon();
	
	if (CMUtilities.IsDefined(TheIcon))
	{
		CMUtilities.AbsolutePosition(TheIcon,Left+28,-5,16,16);
	
		// Set the position of the check boxes
	
		LayerInList.appendChild(TheIcon);
	}
	//***************************************************************************
	// add the name
	
	var TheLayerName=document.createElement('div');
	TheLayerName.className="CM_LayerListNameClass";
	
	var TheName=this.GetName();
	if (TheName===null) TheName="Untitled";
	TheLayerName.innerHTML=TheName;
	
	TheLayerName.TheLayer=this;
	TheLayerName.TheElement=TheElement;
	TheLayerName.LayerInList=LayerInList;
	TheLayerName.TheLayerList=this;

	CMUtilities.AbsolutePosition(TheLayerName,Left+48,0,170,LayerListItemHeight);
	
	//***************************************************************************
	// Mouse down to drag the layer
	//***************************************************************************
	
	this.DraggingDiv=null;
	
	document.addEventListener( "contextmenu", function(event) {
		event.preventDefault(); // keeps regular menu from appearing
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});

	//***************************************************************************
	// event listener for when the user right clicks on the list
	// - regular click is for moving, right click for opening the menu
	
	TheLayerName.addEventListener('mousedown', function(event)
	{
		this.TheLayer.SetSelected(true);
			
		if (event.button==0) // left mouse button was pressed, move the layer in the list
		{
			// find the offset to the mouse click in the name
			
			this.DraggingDiv=document.getElementById("DraggingDiv");
			
			if (this.DraggingDiv==null)
			{
				this.DraggingDiv=document.createElement('div');
				this.DraggingDiv.className="CM_DraggingDivClass";
				this.DraggingDiv.id="DraggingDiv";
			}
			this.DraggingDiv.style.visibility="visible";
			
			this.TheElement.appendChild(this.DraggingDiv);
			
			this.TheElement.DraggingDiv=DraggingDiv;
			this.TheElement.DraggingLayer=this.TheLayer;
			
			// set the inital position of the div
			
			var TheElementPosition=$(this.TheElement).offset();
			
			CMUtilities.AbsolutePosition(this.DraggingDiv,0,event.clientY-TheElementPosition.top,200,0);
		}
		else // right mouse button was pressed, display the popup menu
		{
			//*******************************************************************
			// Create the popup menu if it has not been created already and remove it's contents
			// we use one LayerPopupMenu element for all layers and 
			// just change it's contents when it is selected
			
			var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",event.clientX,event.clientY);
			
			// Add the popup menu items
			this.TheLayer.FillPopupMenu(ThePopupMenu);
		}
		
		event.stopPropagation(); // stop the document from hidding a popup window
		event.preventDefault(); // keeps regular menu from appearing
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});
	TheLayerName.addEventListener('mouseup', function(event)
	{
		event.preventDefault();
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});
	
	// 

	LayerInList.appendChild(TheLayerName);
	
//	LayerInList.style.border="2px solid #ff0000"; // for debugging
	
	var LayerListWidth=jQuery(TheElement).outerWidth(false);
	
	CMUtilities.AbsolutePosition(LayerInList,Left+2,LayerInListTop,LayerListWidth,LayerListItemHeight);
	
	// these were all attempts to get the height of the element in the list after it was added
	// to use for spacing out the items and adding the dragging bar.  They all failed and absolute positioning was used instead.
//	var Height=LayerInList.css('height');
//	var LayerInListHeight=jQuery(LayerInList).outerHeight(false); // there are still some things that only jQuery does well.
//	var LayerListWidth=jQuery(TheElement).outerWidth(false); // there are still some things that only jQuery does well.
//	LayerInListTop+=LayerInList.getBoundingClientRect().height;
//	var Height=LayerInList.getBoundingClientRect().css('height');
}

//*******************************************************************************
// CMItem static functions
//*******************************************************************************
/**
* Adds a delete item to the specific poup menu
* @protected
*/
CMItem.PopupAddDelete=function(ThePopupMenu,TheItem)
{
	//********************************************
	// create the delete menu item
	var DeleteElement=document.createElement('div');
	DeleteElement.setAttribute("id","CM_DeleteElementMenuItem");
	DeleteElement.className="CM_LayerListPopupMenuItem";
	
	DeleteElement.innerHTML="Delete";
	
	DeleteElement.TheItem=TheItem;
	DeleteElement.ThePopupMenu=ThePopupMenu;
	
	DeleteElement.addEventListener('click', function(event)
	{
		var TheParent=this.TheItem.GetParent();
		
		this.ThePopupMenu.style.visibility= "hidden";
		var ItemIndex=TheParent.GetChildIndex(this.TheItem);
		TheParent.RemoveChild(ItemIndex);
			
		event.stopPropagation();
	});
	
	ThePopupMenu.appendChild(DeleteElement);

}
CMItem.PopupMenuAddItem=function(ThePopupMenu,Text,TheParent,ClassName)
{
	//********************************************
	// create the delete menu item
	var TheElement=document.createElement('div');
	TheElement.setAttribute("id","CM_DeleteElementMenuItem");
	TheElement.className="CM_LayerListPopupMenuItem";
	
	TheElement.innerHTML=Text;
	
	TheElement.TheParent=TheParent;
	TheElement.ClassName=ClassName;
	TheElement.ThePopupMenu=ThePopupMenu;
	
	TheElement.addEventListener('click', function(event)
	{
		this.ThePopupMenu.style.visibility= "hidden";
		event.stopPropagation();

		var TheChild = new window[this.ClassName]();
		
		if (this.TheParent instanceof CMGeo)
		{
			this.TheParent.AddLayer(TheChild);
		}
		else
		{
			this.TheParent.AddChild(TheChild);
		}
		this.TheParent.Repaint();
	});
	ThePopupMenu.appendChild(TheElement);
}

//*******************************************************************************
// CMItem functions to be overriden by children
//*******************************************************************************
/**
* 
* @protected, @override
*/
CMItem.prototype.FillPopupMenu=function(ThePopupMenu)
{
	CMItem.PopupAddDelete(ThePopupMenu,this);
}
/**
* 
* @protected, @override
*/
CMItem.prototype.Repaint=function() 
{
	var Result=this.GetParent(CMScene);
	if (Result!=null) Result.Repaint();
}
/**
* 
* @protected, @override
*/
CMItem.prototype.Paint=function(TheView) 
{
}
/**
* 
* @protected, @override
*/
CMItem.prototype.PaintSelected=function(TheView) 
{
}
//*******************************************************************************
// CMItem public functions
//*******************************************************************************
/*
* Returns the current name of the layer
* @public, @deprecated
* @returns Name - the name of the layer
*/
CMItem.prototype.GetName=function()  
{ 
	var Result=this.GetSetting("Item","Name","");
	return(Result); 
}


/*
* Set the human-readable name for the layer.  This name will appear
* in the layer list.
* @public, @deprecated
* @param Name - sets the name of the layer.
*/
CMItem.prototype.SetName=function(Name) 
{
	this.SetSetting("Item","Name",Name);
}


/**
* Gets the value of the selected flag for this object.
* @public
* @returns Selected flag
*/
CMItem.prototype.GetSelected=function() 
{
	return(this.Selected);
}
/**
* Sets this object to be the one the user has selected
* @public
* @returns Selected flag
*/
CMItem.prototype.SetSelected=function(New) 
{
	if (this.Selected!=New)
	{
		// get the scene which may be this object
		
		var TheScene;
		
		if (this instanceof CMScene)
		{
			TheScene=this;
		}
		else
		{
			TheScene=this.GetParent(CMScene);
		}
		
		if (New)  // selecting this object,  unselect previous content 
		{
			TheScene.UnselectAll(false); // unselect but do not send messages because we are about to select (keeps repaints down)
			this.Selected=true; // set the new selection
			
			if (this.LayerInList!=undefined)
			{
				this.LayerInList.className="CM_LayerListItemClass_Selected";
//				this.LayerInList.style.border="1px solid #000000"; 
			}
			TheScene.SelectionChanged(this); // notify everyone that the selectoin changed
		}
		else // unselecting, just notify everyone
		{
			this.Selected=false; // unselect
			this.LayerInList.className="CM_LayerListItemClass";
//			this.LayerInList.style.border="0px none";
			
			TheScene.SelectionChanged(this); // notify everyone that the selectoin chagned
		}
	}
}
/**
* jjg - SetVisible() being deprecated
*/
CMItem.prototype.SetVisible=function(Flag) 
{
	var Status=this.GetSetting("Item","Status");
	
	if ((Flag)&&(Status==CMItem.STATUS_HIDDEN))
	{
		this.SetSetting("Item","Status",CMItem.STATUS_VISIBLE);
		this.Repaint();
	}
	else if ((Flag==false)&&(Status>=CMItem.STATUS_VISIBLE)) // works for true, false, and undefined
	{
		this.SetSetting("Item","Status",CMItem.STATUS_HIDDEN);
		this.Repaint();
	}
}
/**
* Returns the visible state of this item jjg - SetVisible() being deprecated
* @protected
* @returns true if the item is visible, false otherwise
*/
CMItem.prototype.GetVisible=function()
{
	var Result=true;
	
	var Status=this.GetSetting("Item","Status");
	
	if (Status==CMItem.STATUS_HIDDEN)
	{
		Result=false;
	}

	return(Result);
}

//CanvasMap/js/CMItemPoly.js
/******************************************************************************************************************
* CMItemPoly Class
*
* Represents:
* - Straight lines
* - Polylines
* - Polygons
* - Bezier curves
* - Bezier polygons
* Also a superclass for the CMItemPolyArrow class
*
* @module CMDatasetPyramidOpenFormat
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMItemPoly.SettingDefintions=
{
	Curve:
	{
		Coordinates: { Name:"Coordinates",Type:CMBase.DATA_TYPE_COORDINATES, Default:null },
		Smoothing: { Name:"Smoothing",Type:CMBase.DATA_TYPE_BOOLEAN_ARRAY, Default:null }
	}
};

//******************************************************************
// CMItemPoly Constructor
//******************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMItemPoly() 
{
	CMItem.call(this);
	
	// settings
	this.TimeSlices[0].Settings.Curve=	
	{
	};
	// other properties
	this.Anchor=null; // JSON with X,Y
	this.Dragging=false;
	this.Creating=false;
	this.SelectedPart=-1;
	this.Closed=false;
	
	this.Xs=null; // coordinates tweened from settings
	this.Ys=null;
}

CMItemPoly.prototype=Object.create(CMItem.prototype); // inherit prototype functions from PanelBase()

CMItemPoly.prototype.contructor=CMItemPoly; // override the constructor to go to ours

//******************************************************************
// Private Functions
//******************************************************************
/**
* @private
*/
CMItemPoly.prototype.GetAnchor=function(TheView,RefX,RefY,ThePart)
{
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	var Result=CMControlPoints.GetControlPoints(this,MinTime);
	
	var AnchorY=RefX-Result.Xs[ThePart];
	var AnchorX=RefY-Result.Ys[ThePart];
		
	return({X:AnchorX,Y:AnchorY});
}
/**
* @private
*/
CMItemPoly.prototype.Reset=function()
{
	this.Xs=null;
	this.Ys=null;
}
/**
* Initialize the poly to be drawn
* @private
*/
CMItemPoly.prototype.Initialize=function(MinTime) 
{
	if ((this.Xs==null)||(MinTime!=this.TimeOfLastInitialize)) // need to allocate the curves
	{
		var Closed=this.Closed;
		var Smoothing=this.GetSetting("Curve","Smoothing");

		// get the control points
		var Result=CMControlPoints.GetTweenedControlPoints(this);
		
		var Xs=Result.Xs;
		var Ys=Result.Ys;
	
		var Result=CMUtilityBezier.GetBezierOutline(Xs,Ys,Closed,Smoothing);
		
		this.Xs=Result[0];
		this.Ys=Result[1];
		
		this.TimeOfLastInitialize=MinTime;
	}
}
/**
* Returns an index if the coordinate is in the polygon
* @private
* @returns ThePart - -1 for none, -2 for inside, >=0 for one of the control points
*/
CMItemPoly.prototype.InPart=function(TheView,RefX,RefY,RefTolerance)
{
	var ThePart=-1;

	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	var Result=CMControlPoints.GetControlPoints(this,MinTime);
	
	if (Result!=null)
	{
		var X1s=Result.Xs;
		var Y1s=Result.Ys;
		
		ThePart=CMControlPoints.InPart(this,TheView,RefX,RefY,RefTolerance);
		
		// if not part selected and the poly is a polygon, check inside
		if (ThePart==-1)
		{
			if (this.Closed) // try for the interior
			{
				Result=CMUtilities.InsideAPolygon(RefX,RefY,X1s,Y1s,X1s.length);
				
				if (Result) ThePart=-2;
			}
			else // check the edges of the line
			{
				this.Initialize(MinTime);
				
				var Result=CMUtilities.InPolyline(RefX,RefY,this.Xs,this.Ys,RefTolerance);
				
				if (Result) ThePart=-2;
			}
		}
	}
	
	return(ThePart);
}

//******************************************************************
// CMBase Functions
//******************************************************************

CMItemPoly.prototype.GetName=function()  
{ 
	return("Curve"); 
}

CMItemPoly.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions; // save the superclass function

CMItemPoly.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions(); // get the settings definitions from the superclass
	
	for (Key in CMItemPoly.SettingDefintions)
	{
		Result[Key]=CMItemPoly.SettingDefintions[Key];
	}

	return(Result); 
}

//******************************************************************
// CMItem Functions
//******************************************************************
CMItemPoly.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;

	if (this.Creating) // 
	{
		var TheScene=this.GetParent(CMScene);
		
		var MinTime=TheScene.GetTimeRange();
		
		var ControlPoints=CMControlPoints.GetControlPoints(this,MinTime);
		
		var NumPoints=ControlPoints.Xs.length;
		
		if (TheEvent.detail==2) // double click, remove the last point and 
		{
			this.Creating=false;
			this.Dragging=false;
			
			// remove the point that was added on the second click as it is a duplicate
			CMControlPoints.RemoveLastPoint(this);
		}
		else // add a point
		{
			var RefTolerance=this.GetRefTolerance(TheView);
			
			var ThePart=this.InPart(TheView,RefX,RefY,RefTolerance);
			
			if (ThePart==0) // last point, close the polygon
			{
				// remove the last point which is the one being dragged around
				CMControlPoints.RemoveLastPoint(this);
/*				ControlPoints.Xs.pop(); 
				ControlPoints.Ys.pop(); 
				ControlPoints.Smoothing.pop(); 
*/				
				// close the polygon
				this.Closed=true;
				
				this.Creating=false;
				this.Dragging=false;
			}
			else // add the point
			{
				CMControlPoints.AddPoint(this,RefX,RefY,0);
			}
		}
//		this.SetControlPoints(MinTime,ControlPoints.Xs,ControlPoints.Ys,ControlPoints.Smoothing);
		
		Used=true;
		this.Repaint();
	}
	else if (Used==false)
	{
		if (TheEvent.button==0) // left button clicked
		{
			if ((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT)) // select a part to drag
			{
				var RefTolerance=this.GetRefTolerance(TheView);
			
				var SelectedPart=this.InPart(TheView,RefX,RefY,RefTolerance);
		
				if (SelectedPart!=-1)
				{
					var TheScene=this.GetParent(CMScene);
		
					TheScene.UnselectAll(true);
					
					this.Dragging=true;
					this.SelectedPart=SelectedPart;
					this.SetSelected(true);
					
					if (SelectedPart==-2) // inside
					{
						this.Anchor={X:RefX,Y:RefY};
					}
					else
					{
						this.Anchor=this.GetAnchor(TheView,RefX,RefY,SelectedPart);
					}
					Used=true;
				}
			}
		}
		else // right buttonclicked
		{
			var RefTolerance=this.GetRefTolerance(TheView);
			
			var SelectedPart=this.InPart(TheView,RefX,RefY,RefTolerance);
	
			if (SelectedPart>=0) // a point was clicked in
			{
				var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",event.clientX,event.clientY);
				
				//*******************************************************************
				// Add the delete item
				
				var DeleteElement=document.createElement('div');
				DeleteElement.setAttribute("id","CM_DeleteElementMenuItem");
				DeleteElement.className="CM_LayerListPopupMenuItem";
				
				DeleteElement.innerHTML="Delete Vertex";
				
				DeleteElement.TheItem=this;
				DeleteElement.SelectedPart=SelectedPart;
				DeleteElement.ThePopupMenu=ThePopupMenu;
				
				DeleteElement.addEventListener('click', function(event)
				{
					CMControlPoints.DeleteControlPoint(this.TheItem,this.SelectedPart);
					this.ThePopupMenu.style.visibility = "hidden";
					
					// stop event from propogating
					event.stopPropagation();
					
					this.TheItem.Repaint();
				});
				
				ThePopupMenu.appendChild(DeleteElement);
				
				//*******************************************************************
				// Add the duplicate item
				
				var DeleteElement=document.createElement('div');
				DeleteElement.setAttribute("id","CM_DuplicateElementMenuItem");
				DeleteElement.className="CM_LayerListPopupMenuItem";
				
				DeleteElement.innerHTML="Duplicate";
				
				DeleteElement.TheItem=this;
				DeleteElement.SelectedPart=SelectedPart;
				DeleteElement.ThePopupMenu=ThePopupMenu;
				
				DeleteElement.addEventListener('click', function(event)
				{
					this.TheItem.DuplicateControlPoint(this.TheItem,this.SelectedPart);
					
					// stop event from propogating
					event.stopPropagation();
					
					this.TheItem.Repaint();
				});
				
				ThePopupMenu.appendChild(DeleteElement);
/*				
				//*******************************************************************
				// Add the smooth/sharp item
				
				var DeleteElement=document.createElement('div');
				DeleteElement.setAttribute("id","CM_SmoothElementMenuItem");
				DeleteElement.className="CM_LayerListPopupMenuItem";
				
				var Smoothing=this.GetSetting("Curve","Smoothing",undefined,MinTime);
					
				if (Smoothing[SelectedPart]) DeleteElement.innerHTML="Make sharp";
				else  DeleteElement.innerHTML="Make smooth";
				
				DeleteElement.TheItem=this;
				DeleteElement.SelectedPart=SelectedPart;
				DeleteElement.ThePopupMenu=ThePopupMenu;
				
				DeleteElement.addEventListener('click', function(event)
				{
					var Smoothing=this.TheItem.GetSetting("Curve","Smoothing",undefined,MinTime);
					
					if (Smoothing[this.SelectedPart]) Smoothing[this.SelectedPart]=false;
					else Smoothing[this.SelectedPart]=true;
					
					this.TheItem.SetSetting("Curve","Smoothing",Smoothing,MinTime);
					
					// stop event from propogating
					event.stopPropagation();
					
					this.TheItem.Repaint();
				});
				
				ThePopupMenu.appendChild(DeleteElement);
*/				
						
				TheEvent.stopPropagation(); // stop the document from hidding a popup window
				TheEvent.preventDefault(); // keeps regular menu from appearing
		
				Used=true;
			}
			if (SelectedPart==-2) // the inside of the poly was clicked in
			{
				var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",event.clientX,event.clientY);
				
				//*******************************************************************
				// Add the delete item
				
				var DeleteElement=document.createElement('div');
				DeleteElement.setAttribute("id","CM_DeleteElementMenuItem");
				DeleteElement.className="CM_LayerListPopupMenuItem";
				
				DeleteElement.innerHTML="Delete Poly";
				
				DeleteElement.TheItem=this;
				DeleteElement.ThePopupMenu=ThePopupMenu;
				
				DeleteElement.addEventListener('click', function(event)
				{
					var TheLayer=this.TheItem.GetParent();
					TheLayer.RemoveChild(this.TheItem);
					this.ThePopupMenu.style.visibility = "hidden";
					
					// stop event from propogating
					event.stopPropagation();
					
					TheLayer.Repaint();
				});
				
				ThePopupMenu.appendChild(DeleteElement);
						
				TheEvent.stopPropagation(); // stop the document from hidding a popup window
				TheEvent.preventDefault(); // keeps regular menu from appearing
		
				Used=true;
			}
		}
	}
	return(Used);
}

CMItemPoly.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
//	if (this.Clickable)
	{
//		var TheScene=this.GetParent(CMScene);
		
//		var MinTime=TheScene.GetTimeRange();
		
		if (this.Creating)
		{
			CMControlPoints.SetPoint(this,-1,RefX,RefY);
			
			this.Repaint();
		}
		else if (this.Dragging) // dragging an existing item (create or update)
		{
//			var ControlPoints=CMControlPoints.GetControlPoints(this,MinTime);
			
			if (this.SelectedPart==-2) // move entire poly
			{
				var DeltaX=RefX-this.Anchor.X;
				var DeltaY=RefY-this.Anchor.Y;
				
				CMControlPoints.MovePoints(this,DeltaX,DeltaY);
								
				this.Anchor.X=RefX;
				this.Anchor.Y=RefY;
			}
			else
			{
				CMControlPoints.SetPoint(this,this.SelectedPart,RefX+this.Anchor.X,RefY+this.Anchor.Y);
				
//				ControlPoints.Xs[this.SelectedPart]=RefX+this.Anchor.X;
//				ControlPoints.Ys[this.SelectedPart]=RefY+this.Anchor.Y;
			}
			
//			this.SetControlPoints(MinTime,ControlPoints.Xs,ControlPoints.Ys,ControlPoints.Smoothing);
			this.Repaint();
		}
		else // update the mouse cursor
		{
			var RefTolerance=this.GetRefTolerance(TheView);
			
			var ThePart=this.InPart(TheView,RefX,RefY,RefTolerance);
			
			if (ThePart!==-1) 
			{
				var TheCanvasMap=this.GetParent(CMMainContainer);
				var TheCanvasElement=TheCanvasMap.GetElement(CMMainContainer.CANVAS);
				
				TheCanvasElement.style.cursor = "move";
			}
		}
	}
	return(Used);
};
CMItemPoly.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent)
{
	var Used=false;
	
	if ((this.Dragging)&&(this.Creating==false)) 
	{
		this.Dragging=false;
		Used=true;
	}

	return(Used);
};

CMItemPoly.prototype.StartCreating=function(RefX,RefY) 
{
	this.Anchor={X:0,Y:0};
	this.SelectedPart=CMItem.PART_LOWER_RIGHT;
	this.Dragging=true;
	this.Creating=true;
}

CMItemPoly.prototype.Paint=function(TheView) 
{
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	this.Initialize(MinTime);
	
	if (this.Xs!=null) // have more than one point
	{
		var X1s=this.Xs;
		var Y1s=this.Ys;
		
		// setup the style for the lines
		var TheStyle=this.GetStyle(TheView,MinTime);
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);
	
		TheView.PaintRefPoly(X1s,Y1s,this.Closed);		// draw the left side of the arrow
		
		if (TheStyle!=undefined) TheView.RestoreStyle();
		
		// write out the text along the curve if any
		var Text=this.GetSetting("Text","Text");
		
		if (Text!=null)
		{
			var TheStyle=this.GetStyle(TheView,0,"Text");
			
			if (TheStyle!=undefined)
			{
				TheView.SetStyle(TheStyle);
				
				// find the text distance
				
				var TextWidths=[];
				var TotalTextWidth=0;
				
				for (var TextIndex=0;TextIndex<Text.length;TextIndex++)
				{
					var TextWidth=TheView.GetTextWidthInPixels(Text[TextIndex]);
	
					var RefTextWidth=TheView.GetRefWidthFromPixelWidth(TextWidth);
					
					TextWidths.push(RefTextWidth);
					
					TotalTextWidth+=RefTextWidth;
				}
	
				// find the spacing along the curve
				
				var TotalDistance=0;
				
				for (var i=0;i<X1s.length-1;i++)
				{
					var X1=X1s[i]; 
					var Y1=Y1s[i];
					var X2=X1s[i+1];
					var Y2=Y1s[i+1];
					
					TotalDistance+=Math.sqrt(Math.pow(X2-X1,2)+Math.pow(Y2-Y1,2));
				}
				var EndPad=0;
				
				var Spacing=(TotalDistance-(EndPad*2)-TotalTextWidth)/(Text.length);
				
				// draw each character along the curve
				
				var SegmentDistance=0;
				var SegmentLength=0;
				var LastSegmentDistance=0;
				var CurrentSegment=0;
				var DesiredDistance=EndPad;
				var X;
				var Y;
				var Angle;
				
				for (var TextIndex=0;TextIndex<Text.length;TextIndex++)
				{
					// move forward along the segments until we go past the one we want or hit the end of the segments
					while ((SegmentDistance<DesiredDistance)&&(CurrentSegment<X1s.length))
					{
						LastSegmentDistance=SegmentDistance;
						
						// move forward one segment
						CurrentSegment+=1;
						
						var X1=X1s[CurrentSegment-1]; 
						var Y1=Y1s[CurrentSegment-1];
						var X2=X1s[CurrentSegment];
						var Y2=Y1s[CurrentSegment];
						
						SegmentLength=Math.sqrt(Math.pow(X2-X1,2)+Math.pow(Y2-Y1,2));
						
						SegmentDistance+=SegmentLength;
					}
					
					if (CurrentSegment>0)
					{
						// get the angle of the segment
						var X1=X1s[CurrentSegment-1]; 
						var Y1=Y1s[CurrentSegment-1];
						var X2=X1s[CurrentSegment];
						var Y2=Y1s[CurrentSegment];
						
						var DX=X2-X1;
						var DY=Y2-Y1;
					
						Angle=Math.atan2(DY,DX)
						
						// get the position on the segment
						
						var RemamingDistance=DesiredDistance-LastSegmentDistance;
						
						var Factor=RemamingDistance/SegmentLength;
						
						X=X1+(DX*Factor);
						Y=Y1+(DY*Factor);
					}
					else
					{
						// get the angle of the segment
						var X1=X1s[CurrentSegment]; 
						var Y1=Y1s[CurrentSegment];
						var X2=X1s[CurrentSegment+1];
						var Y2=Y1s[CurrentSegment+1];
						
						var DX=X2-X1;
						var DY=Y2-Y1;
					
						Angle=Math.atan2(DY,DX)
						
						X=X1;
						Y=Y1;
					}
					// paint the text
					TheView.PaintRefText(Text[TextIndex],X,Y,12,"center",-Angle);
					
					// move the desired spacing forward
					DesiredDistance+=(TextWidths[TextIndex])+(Spacing);
					
					// if we are not at the last character, add 1/2 the width of the text character
					//if ((TextIndex+1)<Text.length) DesiredDistance+=TextWidths[TextIndex+1]/2;
				}
				TheView.RestoreStyle();
			}
		}
	}
}

CMItemPoly.prototype.PaintSelected=function(TheView) 
{
	if (this.Selected)
	{
		TheView.SaveStyle();
		
		TheView.SetStyle({fillStyle:"rgba(0,0,0,1)",strokeStyle:"white"});
		
		var TheScene=this.GetParent(CMScene);
		
		var MinTime=TheScene.GetTimeRange();
		
		var Result=CMControlPoints.GetControlPoints(this,MinTime);
		
		if (Result!=null)
		{
			var X1s=Result.Xs;
			var Y1s=Result.Ys;
				
			for (var i=0;i<X1s.length;i++)
			{
				TheView.PaintRefCircle(X1s[i],Y1s[i],5);
			}
		}
		TheView.RestoreStyle();
	}
}

//******************************************************************
// CMItemPoly Functions
//******************************************************************
/**
* @public
*/
CMItemPoly.prototype.SetControlPoints=function(TimeSlice,Xs,Ys,Smoothing)
{
	CMControlPoints.SetControlPoints(this,TimeSlice,Xs,Ys,Smoothing);
}


//CanvasMap/js/CMItemPolyArrow.js
/******************************************************************************************************************
* CMItemPolyArrow
*
* Adds an arrow to the end of a CMItemPoly curve.
*
* @module CMItemPolyArrow
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Definitions
//******************************************************************

/**
* Number of steps (line segments) that appear in each Bezier curve.
* @private
*/

CMItemPolyArrow.NUM_STEPS=30;
/**
* Below are the settings definitions.
* @public, @settings
*/
CMItemPolyArrow.SettingDefintions=
{
	Arrow:
	{
		BarbWidth: { Name:"Barb Width",Type:CMBase.DATA_TYPE_FLOAT, Default:5 },
		BarbLength: { Name:"Barb Length",Type:CMBase.DATA_TYPE_FLOAT, Default:5 },
		ShaftWidth: { Name:"Shaft Width",Type:CMBase.DATA_TYPE_FLOAT, Default:2 },
		HeadLength: { Name:"Head Length",Type:CMBase.DATA_TYPE_FLOAT, Default:4 },
	},
};

//******************************************************************
// CMItemPolyArrow Constructor
//******************************************************************

/**
* Arrow setup with Bezier curve for the spine
* @public, @constructs
*/
function CMItemPolyArrow() 
{
	CMItemPoly.call(this);
	
	// settings
	this.TimeSlices[0].Settings.Arrow=	
	{
		BarbWidth:5,
		BarbLength:5,
		ShaftWidth:2,
		HeadLength:4
	};
	//*************************************************************************
	// Properties
	
	// Final polygon to render
	this.FinalXs=null;
	this.FinalYs=null;
	
	// Spine coordinates for debugging
	this.SpineXs=null;
	this.SpineYs=null;
}

CMItemPolyArrow.prototype=Object.create(CMItemPoly.prototype); // inherit prototype functions from PanelBase()

CMItemPolyArrow.prototype.contructor=CMItemPolyArrow; // override the constructor to go to ours

//******************************************************************
// Private Functions
//******************************************************************

CMItemPolyArrow.prototype.ResetCoordinates=function()
{
	this.FinalXs=null;
	this.FinalYs=null;
}
//******************************************************************
// Private Functions to find the outline of the arrow based on the 
// control points
//******************************************************************

/**
* Finds the coordinates to use to draw the arrow.
*
* Takes: Control points, Settings: BarbWidth, etc
* Returns: SpinePoints, FinalPoints
*
* @private
*/
CMItemPolyArrow.prototype.FindCoordinates=function(TheView,TimeSlice) 
{
	if (this.FinalXs==null)
	{
		var Result=this.GetBoundingTimeSlices(TimeSlice);
		
		// assume no tweening
		
		var Settings1=Result[0].Settings;
		
		var BarbWidth=Settings1.Arrow.BarbWidth;
		var BarbLength=Settings1.Arrow.BarbLength;
		var ShaftWidth=Settings1.Arrow.ShaftWidth;
		var HeadLength=Settings1.Arrow.HeadLength;
	
		// if tweening, find the tweened settings
		
		if (Result[1]!=null)
		{
			var Settings2=Result[1].Settings;
			
			var Factor=CMItem.GetTimeFactor(Result);
			
			BarbWidth=((Settings1.Arrow.BarbWidth*(1-Factor))+(Settings2.Arrow.BarbWidth*(Factor)));
			BarbLength=Settings1.Arrow.BarbLength;
			ShaftWidth=Settings1.Arrow.ShaftWidth;
			HeadLength=Settings1.Arrow.HeadLength;
		}
		//
		
		var Result=CMControlPoints.GetTweenedControlPoints(this);
		var Xs=Result.Xs;
		var Ys=Result.Ys;
		
		var Result=CMUtilityBezier.GetCurveWithArrow(Xs,Ys,BarbWidth,BarbLength,ShaftWidth,HeadLength);
	
		// return variables
		this.FinalXs=Result.FinalXs;
		this.FinalYs=Result.FinalYs;
		
		this.SpineXs=Result.SpineXs;
		this.SpineYs=Result.SpineYs;
	}
}

//******************************************************************
// Private Functions
//******************************************************************

//******************************************************************
// CMBase Functions
//******************************************************************

CMItemPolyArrow.prototype.GetName=function()  { return("Arrow"); }

CMItemPolyArrow.prototype.CMItemPoly_GetSettingsDefinitions=CMItemPoly.prototype.GetSettingsDefinitions;

CMItemPolyArrow.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItemPoly_GetSettingsDefinitions();
	
	for (Key in CMItemPolyArrow.SettingDefintions)
	{
		Result[Key]=CMItemPolyArrow.SettingDefintions[Key];
	}
	return(Result); 
}
CMItemPolyArrow.prototype.CMItemPoly_SetSetting=CMItemPoly.prototype.SetSetting;

CMItemPolyArrow.prototype.SetSetting=function(Group,Key,Value,TimeSlice) 
{
	this.CMItemPoly_SetSetting(Group,Key,Value,TimeSlice);
			
	this.ResetCoordinates(); // jjg - later check for settings that impact the drawing of the curve
}
CMItemPolyArrow.prototype.CMItemPoly_SetSettings=CMItemPoly.prototype.SetSettings;

CMItemPolyArrow.prototype.SetSettings=function(NewSettings,TimeSlice) 
{
	this.CMItemPoly_SetSettings(NewSettings,TimeSlice);
			
	this.ResetCoordinates(); // jjg - later check for settings that impact the drawing of the curve
}

//******************************************************************
// CMItem functions 
//******************************************************************

CMItemPolyArrow.prototype.Paint=function(TheView) 
{
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	this.FindCoordinates(TheView,MinTime); // debugging
	
	var TheStyle=this.GetStyle(TheView,MinTime);
	
	if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);
	
	TheView.PaintRefPoly(this.FinalXs,this.FinalYs,true);		// draw the left side of the arrow

	if (TheStyle!=undefined) TheView.RestoreStyle();
}

//******************************************************************
// CMItemPoly functions 
//******************************************************************
CMItemPolyArrow.prototype.CMItemPoly_SetControlPoints=CMItemPoly.prototype.SetControlPoints;

CMItemPolyArrow.prototype.SetControlPoints=function(TimeSlice,Xs,Ys,Smoothing)
{
	this.CMItemPoly_SetControlPoints(TimeSlice,Xs,Ys,Smoothing);
	
	this.ResetCoordinates();
}

//CanvasMap/js/CMItemRect.js
/******************************************************************************************************************
* CMItemRect Class
* An object is something the user can move and edit within a layer
* Objects include rectangles, ovals, arrows, etc.
*
* @module CMDatasetPyramidOpenFormat
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Definitions
//******************************************************************

CMItemRect.RECTANGLE=0;
CMItemRect.OVAL=1; // arcs? pie slices?
CMItemRect.ROUNDED_RECTANGLE=2;

CMItemRect.PART_UPPER_LEFT=0;
CMItemRect.PART_UPPER_RIGHT=1;
CMItemRect.PART_LOWER_RIGHT=2;
CMItemRect.PART_LOWER_LEFT=3;
CMItemRect.PART_TOP=4;
CMItemRect.PART_RIGHT=5;
CMItemRect.PART_BOTTOM=6;
CMItemRect.PART_LEFT=7;
CMItemRect.PART_INSIDE=8;

//******************************************************************
// Constructor
//******************************************************************

/**
* Below are the settings definitions.
* @public, @settings
*/
CMItemRect.SettingDefintions=
{
	Rectangle: 
	{ 
		Coordinates: { Name:"Coordinates",Type:CMBase.DATA_TYPE_COORDINATES, Default:null }
	},
	RoundedRectangle:
	{
		RoundedCornerWidth: { Name:"Corner Width",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
		RoundedCornerHeight: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
	}
};

//******************************************************************
// CMItemRect Constructor
//******************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMItemRect(TheType) 
{
	CMItem.call(this);
	
	this.Type=TheType;
	
	switch (TheType)
	{
	case CMItemRect.RECTANGLE:
		this.SetSetting("Item","Name","Rectangle");
		break;
	case CMItemRect.OVAL:
		this.SetSetting("Item","Name","Oval");
		break;
	case CMItemRect.ROUNDED_RECTANGLE:
		this.SetSetting("Item","Name","Rounded Rectangle");
		break;
	}

	this.TimeSlices[0].Settings.Rectangle=	
	{
		Coordinates:
		{
			Xs:[0,10], // min,max
			Ys:[0,10] // Min,max
		}
	};
	this.TimeSlices[0].Settings.RoundedRectangle=
	{
		RoundedCornerWidth:3,
		RoundedCornerHeight:3
	};
	// other properties
	this.Anchor=null; // JSON with X,Y
	this.Dragging=false;
	
}
CMItemRect.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMItem (makes a copy of CMItem and puts it into the prototype for CMItemRect
// the prototype is copied (without cloning the object's contents) into each new object

CMItemRect.prototype.contructor=CMItemRect; // override the constructor to go to ours

//******************************************************************
// private CMItemRect Functions
//******************************************************************
/**
* Private function to get the control bounds from the settings
* and convert it to XMin,XMax,YMin,YMax
* @private
*/
CMItemRect.prototype.GetControlBounds=function()
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	var Bounds={
		XMin:Coordinates.Xs[0],
		XMax:Coordinates.Xs[1],
		YMin:Coordinates.Ys[0],
		YMax:Coordinates.Ys[1]
	}
	return(Bounds);
}
/**
* Private function to set the control bounds to the settings
* @private
*/
CMItemRect.prototype.SetControlBounds=function(XMin,XMax,YMin,YMax)
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Xs[0]=XMin;
	Coordinates.Xs[1]=XMax;
	Coordinates.Ys[0]=YMin;
	Coordinates.Ys[1]=YMax;
}

/**
* @private
*/
CMItemRect.prototype.GetAnchor=function(RefX,RefY,ThePart)
{
	var AnchorY=0;
	var AnchorX=0;
	
	var Bounds=this.GetControlBounds();
	
	switch (ThePart)
	{
	case CMItemRect.PART_LOWER_LEFT:
		AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMin;
		break;
	case CMItemRect.PART_UPPER_LEFT:
		AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMax;
		break;
	case CMItemRect.PART_LEFT:
		AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		break;
	case CMItemRect.PART_LOWER_RIGHT:
		AnchorX=RefX-Bounds.XMax; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMin;
		break;
	case CMItemRect.PART_UPPER_RIGHT:
		AnchorX=RefX-Bounds.XMax; // positive when cursor to the right of the object
		AnchorY=RefY-Bounds.YMax;
		break;
	case ThePart=CMItemRect.PART_RIGHT:
		AnchorX=RefX-Bounds.XMax; // positive when cursor to the right of the object
		break;
	case CMItemRect.PART_TOP:
		AnchorY=RefY-Bounds.YMax;
		break;
	case CMItemRect.PART_BOTTOM:
		AnchorY=RefY-Bounds.YMin;
		break;
	case CMItemRect.PART_INSIDE:
		AnchorX=RefX-Bounds.XMin; // use bottom left
		AnchorY=RefY-Bounds.YMin;
		break;
	}
	return({X:AnchorX,Y:AnchorY});
}
/**
* @private
*/
CMItemRect.prototype.InPart=function(TheView,RefX,RefY,RefTolerance)
{
	var ThePart=-1;
	
	//var Tolerance=TheView.GetRefWidthFromPixelWidth(ClickPixelTolerance);
		
	var Bounds=this.GetControlBounds();
	
	if ((RefX<Bounds.XMax+RefTolerance)&&(RefX>Bounds.XMin-RefTolerance)
		&&(RefY<Bounds.YMax+RefTolerance)&&(RefY>Bounds.YMin-RefTolerance)) // within the object bounds
	{
		if (RefX<Bounds.XMin+RefTolerance) // left side
		{
			if (RefY<Bounds.YMin+RefTolerance) // bottom left
			{
				ThePart=CMItemRect.PART_LOWER_LEFT;
			}
			else if (RefY>Bounds.YMax-RefTolerance) // top left
			{
				ThePart=CMItemRect.PART_UPPER_LEFT;
			}
			else  // left side
			{
				ThePart=CMItemRect.PART_LEFT;
			}
			Bounds.AnchorX=RefX-Bounds.XMin; // positive when cursor to the right of the object
		}
		else if (RefX>Bounds.XMax-RefTolerance) // right side
		{
			if (RefY<Bounds.YMin+RefTolerance) // bottom right
			{
				ThePart=CMItemRect.PART_LOWER_RIGHT;
			}
			else if (RefY>Bounds.YMax-RefTolerance) // top right
			{
				ThePart=CMItemRect.PART_UPPER_RIGHT;
			}
			else  // right side
			{
				ThePart=CMItemRect.PART_RIGHT;
			}
		}
		else if (RefY>Bounds.YMax-RefTolerance) // top 
		{
			ThePart=CMItemRect.PART_TOP;
		}
		else if (RefY<Bounds.YMin+RefTolerance) // bottom
		{
			ThePart=CMItemRect.PART_BOTTOM;
		}
		else
		{
			ThePart=CMItemRect.PART_INSIDE;
		}
	}
	return(ThePart);
}
/**
* @private
*/
CMItemRect.prototype.SetXMin=function(RefX) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Xs[0]=RefX;
	if (Coordinates.Xs[0]>Coordinates.Xs[1]) 
	{
		Coordinates.Xs[0]=Coordinates.Xs[1];
	}
	
	this.SendMessageToListeners(CMItem.MESSAGE_CONTENT_CHANGED);
}
/**
* @private
*/
CMItemRect.prototype.SetXMax=function(RefX) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Xs[1]=RefX;
	if (Coordinates.Xs[1]<Coordinates.Xs[0]) Coordinates.Xs[1]=Coordinates.Xs[0];
	
	this.SendMessageToListeners(CMItem.MESSAGE_CONTENT_CHANGED);
}
CMItemRect.prototype.SetYMin=function(RefY) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Ys[0]=RefY;
	if (Coordinates.Ys[0]>Coordinates.Ys[1]) Coordinates.Ys[0]=Coordinates.Ys[1];
	
	this.SendMessageToListeners(CMItem.MESSAGE_CONTENT_CHANGED);
}
/**
* @private
*/
CMItemRect.prototype.SetYMax=function(RefY) 
{
	var Result=this.GetBoundingTimeSlices();
	
	var Coordinates=Result[0].Settings.Rectangle.Coordinates;
	
	Coordinates.Ys[1]=RefY;
	if (Coordinates.Ys[1]<Coordinates.Ys[0]) Coordinates.Ys[1]=Coordinates.Ys[0];
	
	this.SendMessageToListeners(CMItem.MESSAGE_CONTENT_CHANGED);
}
//******************************************************************
// CMBase Functions
//******************************************************************

CMItemRect.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions;

CMItemRect.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions();
	
	for (Key in CMItemRect.SettingDefintions)
	{
		Result[Key]=CMItemRect.SettingDefintions[Key];
	}

	return(Result); 
}
//******************************************************************
// CMItem Functions
//******************************************************************

CMItemRect.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	var RefTolerance=this.GetRefTolerance(TheView);
			
	var SelectedPart=this.InPart(TheView,RefX,RefY,RefTolerance);
	
	if (SelectedPart!=-1)
	{
		if (TheEvent.button==0) // left button clicked
		{
			// make sure all other items are unselected
			var TheScene=this.GetParent(CMScene);
			TheScene.UnselectAll(true);
	
			// make this item selected
			this.SelectedPart=SelectedPart;
			this.SetSelected(true);
			
			// start dragging
			this.Dragging=true;
			this.Anchor=this.GetAnchor(RefX,RefY,SelectedPart);
			
			// repain and stop propogation of the event
			this.Repaint();
			Used=true;
		}
		else // right buttonclicked
		{
			var RefTolerance=this.GetRefTolerance(TheView);
			
			var SelectedPart=this.InPart(TheView,RefX,RefY,RefTolerance);
	
			if (SelectedPart!=-1) // something was clicked in
			{
				var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",event.clientX,event.clientY);
				
				//*******************************************************************
				// Add the delete item
				
				var DeleteElement=document.createElement('div');
				DeleteElement.setAttribute("id","CM_DeleteElementMenuItem");
				DeleteElement.className="CM_LayerListPopupMenuItem";
				
				DeleteElement.innerHTML="Delete Item";
				
				DeleteElement.TheItem=this;
				DeleteElement.SelectedPart=SelectedPart;
				DeleteElement.ThePopupMenu=ThePopupMenu;
				
				DeleteElement.addEventListener('click', function(event)
				{
					var TheLayer=this.TheItem.GetParent();
					TheLayer.RemoveChild(this.TheItem);
					this.ThePopupMenu.style.visibility = "hidden";
					
					// stop event from propogating
					event.stopPropagation();
					
					TheLayer.Repaint();
				});
				
				ThePopupMenu.appendChild(DeleteElement);
				
					
				TheEvent.stopPropagation(); // stop the document from hidding a popup window
				TheEvent.preventDefault(); // keeps regular menu from appearing
		
				Used=true;
			}
		}
	}
	return(Used);
}
CMItemRect.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if (this.Dragging) // dragging an existing item (create or update)
	{
		var Anchor=this.Anchor;
		
		switch (this.SelectedPart)
		{
		case CMItemRect.PART_UPPER_LEFT:
			this.SetXMin(RefX+Anchor.X);
			this.SetYMax(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_UPPER_RIGHT:
			this.SetXMax(RefX+Anchor.X);
			this.SetYMax(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_LOWER_RIGHT:
			this.SetXMax(RefX+Anchor.X);
			this.SetYMin(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_LOWER_LEFT:
			this.SetXMin(RefX+Anchor.X);
			this.SetYMin(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_TOP:
			this.SetYMax(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_RIGHT:
			this.SetXMax(RefX+Anchor.X);
			break;
		case CMItemRect.PART_BOTTOM:
			this.SetYMin(RefY+Anchor.Y);
			break;
		case CMItemRect.PART_LEFT:
			this.SetXMin(RefX+Anchor.X);
			break;
		case CMItemRect.PART_INSIDE:
			var Result=this.GetBoundingTimeSlices();
			
			var Coordinates=Result[0].Settings.Rectangle.Coordinates;
			
			var Width=Coordinates.Xs[1]-Coordinates.Xs[0];
			var Height=Coordinates.Ys[1]-Coordinates.Ys[0];
			
			Coordinates.Xs[0]=RefX-Anchor.X;
			Coordinates.Ys[0]=RefY-Anchor.Y;
			Coordinates.Xs[1]=RefX+Width-Anchor.X;
			Coordinates.Ys[1]=RefY+Height-Anchor.Y;
			break;
		}
	
		this.SendMessageToListeners(CMItem.MESSAGE_CONTENT_CHANGED);
		Used=true;
		this.Repaint();
	}
	else // update the mouse cursor
	{
		var RefTolerance=this.GetRefTolerance(TheView);
			
		var ThePart=this.InPart(TheView,RefX,RefY,RefTolerance);
		
		var TheCanvasMap=this.GetParent(CMMainContainer);
		var TheCanvasElement=TheCanvasMap.GetElement(CMMainContainer.CANVAS);
		
		TheCanvasElement.style.cursor = "crosshair";
		
		switch (ThePart)
		{
		case CMItemRect.PART_UPPER_LEFT:
			TheCanvasElement.style.cursor = "nw-resize";
			break;
		case CMItemRect.PART_UPPER_RIGHT:
			TheCanvasElement.style.cursor = "ne-resize";
			break;
		case CMItemRect.PART_LOWER_RIGHT:
			TheCanvasElement.style.cursor = "se-resize";
			break;
		case CMItemRect.PART_LOWER_LEFT:
			TheCanvasElement.style.cursor = "sw-resize";
			break;
		case CMItemRect.PART_TOP:
		case CMItemRect.PART_BOTTOM:
			TheCanvasElement.style.cursor = "s-resize";
			break;
		case CMItemRect.PART_RIGHT:
		case CMItemRect.PART_LEFT:
			TheCanvasElement.style.cursor = "e-resize";
			break;
		case CMItemRect.PART_INSIDE:
			TheCanvasElement.style.cursor = "move";
			break;
		}
	}
	return(Used);
}
CMItemRect.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if (this.Dragging) // 
	{
		this.Dragging=false;
		Used=true;
	}
	return(Used);
};

CMItemRect.prototype.Paint=function(TheView) 
{
	var TheScene=this.GetParent(CMScene);
	
	var MinTime=TheScene.GetTimeRange();
	
	var TheStyle=this.GetStyle(TheView,MinTime);
	
	if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);
	
	var Bounds=this.GetControlBounds();
	
	switch (this.Type)
	{
	case CMItemRect.RECTANGLE:
		TheView.PaintRefRect(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax);
		break;
	case CMItemRect.OVAL:
		TheView.PaintRefArc(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax,0,2*Math.PI)
		break;
	case CMItemRect.ROUNDED_RECTANGLE:
		var Result=this.GetBoundingTimeSlices(MinTime);
		
		var RoundedRectangle=Result[0].Settings.RoundedRectangle;
		
		TheView.PaintRefRoundedRect(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax,
			RoundedRectangle.RoundedCornerWidth,RoundedRectangle.RoundedCornerHeight);
		break;
	}
	if (TheStyle!=undefined) TheView.RestoreStyle();
	
	// render text
	var TheText=this.GetSetting("Text","Text");
	
	if (CMUtilities.IsDefined(TheText))
	{
		var TheStyle=this.GetStyle(TheView,MinTime,"Text");
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle,true);
		
		// find the font size
		var FontSize=30; // in pixels (only uesd on collision detection)
		var Font=this.GetSetting("Text","font",undefined,MinTime);
		
		if (CMUtilities.IsDefined(Font))
		{
			FontSize=CMUtilities.GetFontSizeFromFont(Font);
		}
		else
		{
			Font=FontSize+"px arial";
		}
		
		var RefFontSize=TheView.GetRefHeightFromPixelHeight(FontSize);
		
		// find the center of the text
		var RefY=(Bounds.YMin+Bounds.YMax)/2;
		var RefX=(Bounds.XMin+Bounds.XMax)/2;
		TheView.TheContext.font = FontSize+"px arial";
		TheView.TheContext.textBaseline="middle";
		
		TheView.PaintRefText(TheText,RefX,RefY,FontSize,"center",0);
		
		if (TheStyle!=undefined) TheView.RestoreStyle();
	}
}
CMItemRect.prototype.PaintSelected=function(TheView) 
{
	if (this.GetSelected())
	{
		TheView.SaveStyle();
		
		TheView.SetStyle({fillStyle:"rgba(0,0,0,1)",strokeStyle:"white"});
		
		var Bounds=this.GetControlBounds();
		
		TheView.PaintRefCircle(Bounds.XMin,Bounds.YMin,5);
		TheView.PaintRefCircle(Bounds.XMin,Bounds.YMax,5);
		TheView.PaintRefCircle(Bounds.XMax,Bounds.YMin,5);
		TheView.PaintRefCircle(Bounds.XMax,Bounds.YMax,5);
		
		TheView.RestoreStyle();
	}
}

CMItemRect.prototype.StartCreating=function(RefX,RefY) 
{
	this.Anchor={X:0,Y:0};
	this.SelectedPart=CMItemRect.PART_LOWER_RIGHT;
	this.Dragging=true;
}

//CanvasMap/js/CMLayer.js
/******************************************************************************************************************
* CMLayer
* This class is the base class for all other layers.  This class contains functions and properties for feature and raster based
* classes.  This is because the CMLayerPyramid supports both raster and vector data.  This also may be a trend with data formats like KML.
*
* @module CMLayer
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/

//*****************************************************************************************************************
// Definitions
//*****************************************************************************************************************

/**
* Definitions for types of marks
* @public, @enum
*/
CMLayer.MARK_CIRCLE=0;
CMLayer.MARK_TRIANGLE=1;
CMLayer.MARK_SQUARE=2;
CMLayer.MARK_STAR=3;

/**
* Array for the types of directions
* @private (may be made public later)
*/
CMLayer.LABEL_DIRECTIONS=["TL","T","TR","R","BR","B","BL","L"]; // definitions for the direction a label will be from its point

/**
* Below are the additional settings definitions for STLayers.  Setings for the basic drawing style and text
* style are inherited from STItem
* @public, @settings
*/
CMLayer.SettingDefintions=
{
	Layer:
	{
		InfoText: { Name:"Info Text",Type:CMBase.DATA_TYPE_STRING, Default:undefined }, // HTML content to appear in the Info box
		Metadata: { Name:"Metadata",Type:CMBase.DATA_TYPE_STRING, Default:undefined }, // source information for the data in the layer
		MinZoom: { Name:"Min Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:-Infinity }, // layer is hidden below this zoom level
		MaxZoom: { Name:"Max Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:Infinity }, // layer is hidden above this zoom level
		ZoomToBoundsOnLoad: { Name:"Zoom To Bounds On Load",Type:CMBase.DATA_TYPE_BOOLEAN, Default:false }, // If true, the scene will zoom to the layer bounds after the layer's data is loaded
	}, 
	Mark: 
	{ 
		Type: { Name:"Type",Type:CMBase.DATA_TYPE_ENUMERATED, Options:[CMLayer.MARK_CIRCLE,CMLayer.MARK_TRIANGLE,CMLayer.MARK_SQUARE,CMLayer.MARK_STAR],Default:CMLayer.MARK_CIRCLE },
		Size: { Name:"Size",Type:CMBase.DATA_TYPE_FLOAT, Default:3 },
	},
	IconImage:
	{
		URL: { Name:"URL",Type:CMBase.DATA_TYPE_URL, Default:"" },
		TheImage: { Name:"Image",Type:CMBase.DATA_TYPE_IMAGE, Default:null },
		OffsetX: { Name:"Offset X",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		OffsetY: { Name:"Offset Y",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
	},
	LabelBox: 
	{
		Position: { Name:"Position",Type:CMBase.DATA_TYPE_ENUMERATED, Options:CMLayer.LABEL_DIRECTIONS,Default:"TR" },
		OffsetX: { Name:"Offset X",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		OffsetY: { Name:"Offset Y",Type:CMBase.DATA_TYPE_FLOAT, Default:0 },
		Padding: { Name:"Padding",Type:CMBase.DATA_TYPE_FLOAT, Default:2 },
		
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	MouseOverStyle:
	{
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,0,0)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	SelectedStyle:
	{
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,255)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y Offset",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
};

//*****************************************************************************************************************
// Constructors
//*****************************************************************************************************************

/**
* Constructor for a layer object.  Layers contain spatial data that appears in a scene
* @public, @constructs
*/
function CMLayer() 
{
	CMItem.call(this);
	
	// settings
	
	this.InfoWindowWidth=300; // jjg setting
	
	this.TimeSlices[0].Settings.Layer=	
	{
	};
	this.TimeSlices[0].Settings.Dataset=	
	{
	};
	this.TimeSlices[0].Settings.Mark=	
	{
	};
	this.TimeSlices[0].Settings.IconImage=
	{
	};
	this.TimeSlices[0].Settings.LabelBox=
	{
	};
	this.TimeSlices[0].Settings.MouseOverStyle=
	{
	};
	this.TimeSlices[0].Settings.SelectedStyle=
	{
		strokeStyle:"rgb(120,100,255)",
		lineWidth:"3",
		fillStyle:"rgba(0,0,0,0)"
	};
	
	/*
	* settings specific to individual features, must be set outside constructor to be unique to each layer. 
	* This is an array.  Each element has the same form as other settings:
	* { Group:
	*    { Key:Value }
	* }
	*/
	this.FeatureSettings=null;  // 
	/*
	*/
	this.SettingsAttributes=null; // objects with {Group:{Key: AttributeName} } with entries for each setting that is coming from an attribute

	//************************************************
	// general properties
	
	this.TheBounds=null; // the overall bounds (only as good as the information from the layers)
	
	// internally set properties
	
	this.FeatureBounds=null; // bounds of each feature, cached for speed (jjg move to CMDataset?)
	
	var SettingsDirty=null; // array for attriubtes, if true, settings need to be updated from attributes
	
	this.TheProjector=null;
	
	// layers should be selectable on initialization
	this.SetSetting("Item","Status",CMItem.STATUS_SELECTABLE);
}

CMLayer.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMBase()

CMLayer.prototype.contructor=CMLayer; // override the constructor to go to ours

//******************************************************************
// CMBase Functions
//******************************************************************

CMLayer.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions;

CMLayer.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions();
	
	for (Key in CMLayer.SettingDefintions)
	{
		Result[Key]=CMLayer.SettingDefintions[Key];
	}

	return(Result); 
}
/**
* Utility function to call old event handlers
* @public
*/
CMLayer.prototype.SendMessageToDescendants=function(Message,AdditionalInfo)
{
	Used=false;
	
	switch (Message)
	{
	case CMView.MESSAGE_MOUSE_DOWN:
		Used=this.MouseDown(AdditionalInfo.TheView,AdditionalInfo.RefX,AdditionalInfo.RefY,AdditionalInfo.TheEvent);
		break;
	case CMView.MESSAGE_MOUSE_MOVE:
		Used=this.MouseMove(AdditionalInfo.TheView,AdditionalInfo.RefX,AdditionalInfo.RefY,AdditionalInfo.TheEvent);
		break;
	case CMView.MESSAGE_MOUSE_UP:
		Used=this.MouseUp(AdditionalInfo.TheView,AdditionalInfo.RefX,AdditionalInfo.RefY,AdditionalInfo.TheEvent);
		break;
	}
	return(Used);
}

//******************************************************************
// Functions used by subclasses and not overriden
//******************************************************************

/**
* Checks if the layer is visible.  This is different form GetVisible() because it
* also checks for an optional zoom range
* @public
*/
CMLayer.prototype.IsVisible=function(TheView)
{
	var Result=this.GetVisible();
	
	if ((Result)&&(TheView instanceof CMView2D)) // may have to check zoom range
	{
		var MinZoom=this.GetSetting("Layer","MinZoom"); // typically this will not be set so this will be fast
		var MaxZoom=this.GetSetting("Layer","MaxZoom"); // typically this will not be set so this will be fast
		
		if (CMUtilities.IsDefined(MinZoom)) { Result=this.InZoomRange([MinZoom,MaxZoom]); }
	}
	return(Result);
};
/**
* Returns true if the view is within the specified Zoom Range or the zoome range is null
* This is a utility function for the IsVisible() and IsFeatureVisible() functions
* @param ZoomRange - array with [MinZoom,MaxZoom]
* @returns Flag - true if the view is visible in the zoom range, false otherwise.
*/
CMLayer.prototype.InZoomRange=function(ZoomRange)
{
	var Result=true;
	
	var TheScene=this.GetScene();
	
	if ((ZoomRange!=null)&&(TheScene!=null)&&(TheScene.GetView(0)!=null))
	{
		var TheView=TheScene.GetView(0);
		var TheZoom=TheView.GetZoomLevel();
		
		if ((TheZoom<ZoomRange[0])||(TheZoom>ZoomRange[1])) // current zoom is less than min or greater than max
		{
			Result=false;
		}
	}
	return(Result);
}
/**
* Check if the feature is visible in the view.
* @private
* @param FeatureIndex - index for the feature to check
* @returns Flag - true if the feature is visible in the view, false otherwise.
*/
CMLayer.prototype.IsFeatureVisible=function(TheView,FeatureIndex)
{
	var Result=this.IsVisible(TheView);
	
	if (Result) // may have to check zoom range
	{
		var MinZoom=this.GetFeatureSetting("Layer","MinZoom",FeatureIndex); // typically this will not be set so this will be fast
		var MaxZoom=this.GetFeatureSetting("Layer","MaxZoom",FeatureIndex); // typically this will not be set so this will be fast
		
		if (MinZoom!=null) { Result=this.InZoomRange([MinZoom,MaxZoom]); }
	}
	return(Result);
};

/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Object for Bounds with format {XMin,XMax,YMin,YMax}
*/
CMLayer.prototype.SetBounds=function(NewBounds) 
{
	this.TheBounds=NewBounds;
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMLayer.prototype.GetBounds=function() 
{
	return(this.TheBounds);
}

/**
* Returns the Scene the layer is in.
* @public
* @returns TheScene - the scene the layer is contained in or null for none.
*/
CMLayer.prototype.GetScene=function() 
{ 
	var Result=this.GetParent(CMScene);
	return(Result); 
}

/**
* Sets the width of the information window
* @public
* @param NewWidth - Width of the info popup window in pixels
*/
CMLayer.prototype.SetInfoWindowWidth=function(NewWidth) 
{
	this.InfoWindowWidth=NewWidth;
}
/**
* Gets the width of the information window
* @public
* @returns NewWidth - Width of the info popup window in pixels
*/
CMLayer.prototype.GetInfoWindowWidth=function() 
{
	return(this.InfoWindowWidth);
}

//******************************************************************
// Feature-based functions
//******************************************************************

/**
* Sets the feature that is selected
* @public
* @param NewFeatureIndex - >=0 indicates a feature, -1 is for none.
*/
CMLayer.prototype.SetSelectedFeature=function(New) 
{
}
/**
* Sets the current feature that the mouse is over
* @public
* @param NewFeatureIndex - index to the feature the mouse is over (typcially returned by In())
*/
CMLayer.prototype.SetMouseOverFeature=function(New) 
{
}
/**
* Returns the current feature that the mouse is over
* @public
* @returns FeatureIndex - index to the feature the mouse is over (typcially returned by In()), or -1 for none
*/
CMLayer.prototype.ResetMouseOverFeature=function() 
{
}

//******************************************************************
// Property Gets and Sets (jjg - move to CMLayerDataset?)
//******************************************************************
/**
* Set the attribute column to obtain property values for features from
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - Heading of the column to extract values from.
*/
CMLayer.prototype.SetSettingAttribute=function(Group,Key,AttributeName)
{
	// allocate the settings object if needed
	if (this.SettingsAttributes==null) this.SettingsAttributes={};

	// add the group if needed
	if ((Group in this.SettingsAttributes)==false) this.SettingsAttributes[Group]={}
	
	// save the key and name of the attribute column for this setting
	this.SettingsAttributes[Group][Key]=AttributeName;
}
/**
* Get the attribute column to obtain property values for features from
* @public
* @param Group - 
* @param Key - 
* @returns Value - Heading of the column to extract values from.
*/
CMLayer.prototype.GetSettingsAttribute=function(Group,Key)
{
	var Result=null;
	
	if (this.SettingsAttributes!==null)
	{
		if (Group in this.SettingsAttributes) { Result=this.SettingsAttributes[Group][Key]; }
	}
	return(Result);
}
/**
* Set the feature settings into an array indexed by FeatureIndexes
* @public
* @param FeatureIndex - Index to the feature
* @param FeatureProperties - array of properties indexed by the feature indexes
*/
CMLayer.prototype.SetFeatureSettings=function(FeatureIndex,OneFeaturesSettings) // jjg - probably not needed (just use Group)
{
	if (this.FeatureSettings==null)
	{
		this.FeatureSettings=new Array();
	}
	this.FeatureSettings[FeatureIndex]=OneFeaturesSettings;
	
	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}

/**
* Sets an entire group of settings for one feature
* @public
* @param Group - The name of the group to set
* @param FeatureIndex - Index to the feature
* @param OneFeaturesSettingGroup - the settings
*/
CMLayer.prototype.SetFeatureSettingGroup=function(Group,FeatureIndex,OneFeaturesSettingGroup)
{
	if (this.FeatureSettings==null)
	{
		this.FeatureSettings=new Array();
	}
	if (this.FeatureSettings[FeatureIndex]==undefined) this.FeatureSettings[FeatureIndex]={};
	
	if (this.FeatureSettings[FeatureIndex][Group]==undefined) this.FeatureSettings[FeatureIndex][Group]={};
	
	this.FeatureSettings[FeatureIndex][Group]=OneFeaturesSettingGroup;
	
	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}
/**
* Gets an entire group of settings for one feature
* @public
* @param Group - The name of the group to set
* @param FeatureIndex - Index to the feature
* @returns - the desired group of settings or TheDefault if none
*/
CMLayer.prototype.GetFeatureSettingGroup=function(Group,FeatureIndex,Default)
{
//	this.UpdateSettingsFromAttributes(FeatureIndex);
		
	var Result=Default;
	
	if (this.FeatureSettings!=null)
	{
		if (this.FeatureSettings[FeatureIndex]!=undefined)
		{
			if (this.FeatureSettings[FeatureIndex][Group]!=undefined) Result=this.FeatureSettings[FeatureIndex][Group];
		}
	}
	return(Result);
}

/**
* Set an individual feature property based on it's FeatureIndex
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param FeatureIndex - Feature to apply the property to
* @param Value - value for the property for the feature
*/
CMLayer.prototype.SetFeatureSetting=function(Group,Key,FeatureIndex,Value)
{
	if (this.FeatureSettings==null) this.FeatureSettings=new Array();

	if (this.FeatureSettings[FeatureIndex]==undefined) this.FeatureSettings[FeatureIndex]={};
	
	if ((Group in this.FeatureSettings[FeatureIndex])==false) this.FeatureSettings[FeatureIndex][Group]={};
	
	this.FeatureSettings[FeatureIndex][Group][Key]=Value;
	
	this.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
}
/**
* Returns a property for a specific feature.  Returns null if the property
* is not specified for the feature.
* @public
* @param Key - on of the CMLayer.INFO enumerated types
* @param FeatureIndex - Feature to apply the property to
* @param Default - The default value to return if the property has not been specified.
* @returns Value - value for the property for the feature
*/
CMLayer.prototype.GetFeatureSetting=function(Group,Key,FeatureIndex,Default)
{
//	this.UpdateSettingsFromAttributes(FeatureIndex);
		
	var Result=this.GetSetting(Group,Key,Default);
	
	if (this.FeatureSettings!==null)
	{
		var TheFeaturesSettings=this.FeatureSettings[FeatureIndex];
		
		if (TheFeaturesSettings!=undefined)
		{
			if (Group in TheFeaturesSettings)
			{
//				var Result=this.FeatureSettings[FeatureIndex][Group][Key];
				var GroupSettings=TheFeaturesSettings[Group];
				
				if (Key in GroupSettings)
				{
					Result=GroupSettings[Key];
				}
			}
		}
	}
	return(Result);
}
//**************************************************************
// CMLayer functions
//**************************************************************
CMLayer.prototype.SetProjector=function(NewProjector)
{
	this.TheProjector=NewProjector;
}

CMLayer.prototype.GetProjector=function()
{
	return(this.TheProjector);
}

/*
* Called to obtain the data for the layer from a URL.
* jjg - I think thisneeds to go away (it is in CMLayerDataset)
* @override, @public
*/
CMLayer.prototype.RequestData=function() 
{
	var URL=this.GetSetting("Dataset","URL",null); // jjg this setting is not in this class!
	this.SetURL(URL);
}
/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
*/
CMLayer.prototype.SetURL=function(URL) 
{
	CMMainContainer("Sorry, this function must be overriden");
}
//******************************************************************
// Painting Style functions
//******************************************************************

/**
* Icon for point features
* @public
* @param TheURL - the URL of the image to use for all features
* @param OffsetX - horizontal offset in pixels to go from the upper left of the image to the hot spot
* @param OffsetY - vertical offset in pixels to go from the upper left of the image to the hot spot
*/
CMLayer.prototype.SetIconImage=function(TheURL,OffsetX,OffsetY) 
{
	var TheImage=new Image(); 
	TheImage.Loaded=false;
	TheImage.TheURL=TheURL;
	TheImage.TheLayer=this;
	TheImage.OffsetX=OffsetX;
	TheImage.OffsetY=OffsetY;
	
	TheImage.onload=function() 
	{ 
		this.Loaded=true;
		
		this.TheLayer.SetSetting("IconImage","URL",this.TheURL);
		this.TheLayer.SetSetting("IconImage","TheImage",this);
		this.TheLayer.SetSetting("IconImage","OffsetX",this.OffsetX);
		this.TheLayer.SetSetting("IconImage","OffsetY",this.OffsetY);
		
		this.TheLayer.Repaint(); 
	};
	
	TheImage.src=TheURL; // triggers the load
};
/**
* Icon for point features
* @public
* @param TheURL - the URL of the image to use for all features
* @param OffsetX - horizontal offset in pixels to go from the upper left of the image to the hot spot
* @param OffsetY - vertical offset in pixels to go from the upper left of the image to the hot spot
*/
CMLayer.prototype.SetFeatureIconImage=function(FeatureIndex,TheURL,OffsetX,OffsetY) 
{
	var TheImage=new Image(); 
	TheImage.FeatureIndex=FeatureIndex;
	TheImage.Loaded=false;
	TheImage.TheLayer=this;
	TheImage.OffsetX=OffsetX;
	TheImage.OffsetY=OffsetY;
	
	TheImage.onload=function() 
	{ 
		this.Loaded=true;
		
		this.TheLayer.SetFeatureSetting("IconImage","URL",this.FeatureIndex,this.TheURL);
		this.TheLayer.SetFeatureSetting("IconImage","TheImage",this.FeatureIndex,this);
		this.TheLayer.SetFeatureSetting("IconImage","OffsetX",this.FeatureIndex,this.OffsetX);
		this.TheLayer.SetFeatureSetting("IconImage","OffsetY",this.FeatureIndex,this.OffsetY);
		
		this.TheLayer.Repaint(); 
	};
	
	TheImage.src=TheURL; // triggers the load
};
//******************************************************************
// Functions for subclasses to call (protected)
// These functions are called by subclass layers to draw various types
// of data into the view of the scene.
//******************************************************************

/**
* Utility function to set the label font into the context and to return
* the current font size for bounds calculations.
* @protected
* @param TheView - the view to paint into
* @param FeatureIndex - the feature to paint
* @param RefX - X reference coordinate value
* @param RefY - Y reference coordinate value
* @param TheIconImage
*/
CMLayer.prototype.SetupLabelFont=function(TheView,FeatureIndex)
{
	//************************
	// get font size to determine the width of the text to place the label
	
	var LabelFont=this.GetFeatureSetting("Text","font",FeatureIndex,"Arial 12px");
//	var FontFace="Arial";
	var FontSize=20;
	
	if ((LabelFont!=null)&&(LabelFont!=undefined)) // make sure we strip "px" off the size
	{
		var Index=LabelFont.indexOf("px");
		if (Index!=-1)
		{
			var Temp=LabelFont.substring(0,Index);
			var Index2=Temp.lastIndexOf(" ");
			if (Index2!=-1) Temp=Temp.substring(Index2+1);
			FontSize=parseInt(Temp);
		}
	}
	// setup the font
	var TheContext=TheView.GetContext();
	
	TheContext.font = LabelFont;
	
	return(FontSize); // this is returned so calling code does not have to deal with it.
}
/**
* Utility function to paint a point at a reference coordinate
* @protected
* @param TheView - the view to paint into
* @param FeatureIndex - the feature to paint
* @param RefX - X reference coordinate value
* @param RefY - Y reference coordinate value
* @param SelectedOnly - false unless we are drawing the selected point on top of everything else
*/
CMLayer.prototype.PaintPoint=function(TheView,FeatureIndex,RefX,RefY,SelectedOnly,MouseOverOnly)
{
	if (this.IsFeatureVisible(TheView,FeatureIndex))
	{
//		this.UpdateSettingsFromAttributes(FeatureIndex);
		
		// convert the ref coordinate to pixels
		
		var Result=TheView.GetPixelFromRef(RefX,RefY);
		var PixelX=Result.PixelX;
		var PixelY=Result.PixelY;
	
		// find the correct image for this point, if any
		
		//var TheFeatureImage=this.GetSettingGroup("IconImage");
		
		var TheFeatureImage=this.GetFeatureSettingGroup("IconImage",FeatureIndex,TheFeatureImage);
		
		//
		
		if ((TheFeatureImage!=undefined)&&(TheFeatureImage.TheImage!==undefined)) // there is an icon image
		{
			var Bounds={
				XMin:PixelX+TheFeatureImage.OffsetX,
				XMax:PixelX+TheFeatureImage.OffsetX+TheFeatureImage.TheImage.width,
				YMin:PixelY+TheFeatureImage.OffsetY,
				YMax:PixelY+TheFeatureImage.OffsetY+TheFeatureImage.TheImage.height
			};
			if (TheView.CheckCollision(Bounds)==false)
			{
				TheView.AddToCollisions(Bounds);
				
				TheView.PaintImage(TheFeatureImage.TheImage,PixelX+TheFeatureImage.OffsetX,PixelY+TheFeatureImage.OffsetY);
			}
		}
		else // must be a mark
		{
			var TheStyle=null;
			
			if (SelectedOnly)
			{
				TheStyle=this.GetStyle(TheView,0,"SelectedStyle");
			}
			else if (MouseOverOnly)
			{
				TheStyle=this.GetStyle(TheView,0,"MouseOverStyle");
			}
			else
			{
				TheStyle=this.GetStyle(TheView);
				TheStyle=this.GetFeatureSettingGroup("Style",FeatureIndex,TheStyle);
			}
			if (TheStyle!==null) { TheView.SetStyle(TheStyle,true); }
//			if (TheStyle!==null) { TheView.SetStyle(TheStyle,true); }
			
//			var TheFeatureStyle=this.GetFeatureSettingGroup("Style",i,TheStyle);
				
//			if (TheFeatureStyle!==null) { TheView.SetStyle(TheFeatureStyle,false); }
			
			// draw the mark
			
			var TheSize=this.GetFeatureSetting("Mark","Size",FeatureIndex,5);
			var TheType=this.GetFeatureSetting("Mark","Type",FeatureIndex,CMLayer.MARK_CIRCLE);
			
			var HalfSize=TheSize/2;
			
			var Bounds={
				XMin:PixelX-HalfSize,
				XMax:PixelX+HalfSize,
				YMin:PixelY-HalfSize,
				YMax:PixelY+HalfSize
			};
			if (TheView.CheckCollision(Bounds)==false)
			{
				TheView.AddToCollisions(Bounds);
			
				switch (TheType)
				{
				case CMLayer.MARK_CIRCLE:
					TheView.PaintCircle(PixelX,PixelY,HalfSize);
					break;
				case CMLayer.MARK_SQUARE:
					TheView.PaintRect(PixelX-HalfSize,PixelX+HalfSize,PixelY-HalfSize,PixelY+HalfSize);
					break;
				case CMLayer.MARK_TRIANGLE:
					{
						var TheRefSize=TheView.GetRefWidthFromPixelWidth(TheSize);
						
						var Triangle=CMUtilities.GetRegularPolygon(3,TheRefSize/2,RefX,RefY, 180);
						TheView.PaintRefPoly(Triangle[0],Triangle[1],true);
					}
					break;
				case CMLayer.MARK_STAR:
					{
						var TheRefSize=TheView.GetRefWidthFromPixelWidth(TheSize);
						
						var Star=CMUtilities.GetStar(5,TheRefSize,RefX,RefY, 0);
						TheView.PaintRefPoly(Star[0],Star[1],true);
					}
					break;
				}
			}
			if (TheStyle!=undefined) TheView.RestoreStyle();
		}
		//************************************************************************
		// see if there is a label
		var TheLabel=this.GetFeatureSetting("Text","Text",FeatureIndex,null);
		
		if (TheLabel!=null) // draw the label if there is one
		{
			TheLabel=""+TheLabel; // make sure the label is a string
			
			var LabelStyle=this.GetStyle(TheView,0,"Text") ;
			
			if (LabelStyle!=undefined) TheView.SetStyle(LabelStyle);
			
			var FontSize=this.SetupLabelFont(TheView,FeatureIndex);
			
			var TheContext=TheView.GetContext();
			
			// setup the parameters for drawing
			var OffsetX=10;
			var OffsetY=10;
			
			var Direction=this.GetFeatureSetting("LabelBox","Position",FeatureIndex,"T");
			OffsetX=this.GetFeatureSetting("LabelBox","OffsetX",FeatureIndex,OffsetX);
			OffsetY=this.GetFeatureSetting("LabelBox","OffsetY",FeatureIndex,OffsetY);
			
			// find the array of lines
			
			var Lines=TheLabel.split("<br>");
			
			// find the dimensions
			
			var Height=Lines.length*FontSize;
			var LineWidths=[];
			
			var MaxWidth=0;
			for (var i=0;i<Lines.length;i++)
			{
				Lines[i]=Lines[i].trim(); // remove any white space
				
				LineWidths.push(TheContext.measureText(Lines[i]).width);
				
				if (LineWidths[i]>MaxWidth) MaxWidth=LineWidths[i];
			}
			
			// find the x start position
			
			var PixelLeft=0;
			
			switch (Direction)
			{
			case "TL":
			case "L":
			case "BL":
				PixelLeft=PixelX-OffsetX-MaxWidth;
				break;
			case "T":
			case "B":
			default: // centered
				PixelLeft=PixelX-MaxWidth/2;
				break;
			case "BR":
			case "TR":
			case "R":
				PixelLeft=PixelX+OffsetY;
				break;
			}
			
			// find the y start position
			
			var PixelTop=0;

			switch (Direction)
			{
			case "TL":
			case "T":
			case "TR":
				PixelTop=PixelY-OffsetY-Height;
				break;
			case "R":
			case "L":
			default: // centered
				PixelTop=PixelY-Height/2;
				break;
			case "BR":
			case "B":
			case "BL":
				PixelTop=PixelY+OffsetY;
				break;
			}
			
			// find the x start position
			
			var X=PixelLeft;
			var Y=PixelTop+FontSize; // move to the first baseline
			
			var Bounds={
				XMin:X,
				XMax:X+MaxWidth,
				YMin:PixelTop,
				YMax:PixelTop+Height
			};

			var ViewRefExtent=TheView.GetBounds();
			var ViewPixelExtent={};
			
			ViewPixelExtent.XMin=TheView.GetPixelXFromRefX(ViewRefExtent.XMin);
			ViewPixelExtent.XMax=TheView.GetPixelXFromRefX(ViewRefExtent.XMax);
			ViewPixelExtent.YMin=TheView.GetPixelYFromRefY(ViewRefExtent.YMax);
			ViewPixelExtent.YMax=TheView.GetPixelYFromRefY(ViewRefExtent.YMin);
			
			if (CMUtilities.BoundsOverlap(ViewPixelExtent,Bounds))
			{
				if (TheView.CheckCollision(Bounds)==false)
				{
					TheView.AddToCollisions(Bounds);
				
					var TheLabelBoxStyle=this.GetStyle(TheView,0,"LabelBox");
					
					if ((TheLabelBoxStyle!=null)&&((TheLabelBoxStyle.fillStyle!=undefined)||(TheLabelBoxStyle.strokeStyle!=undefined)))
					{
						var Padding=this.GetSetting("LabelBox","Padding");
						
						TheView.SetStyle(TheLabelBoxStyle);
						TheView.PaintRect(Bounds.XMin-Padding,Bounds.XMax+Padding,Bounds.YMin-Padding,Bounds.YMax+Padding);
						TheView.RestoreStyle();
					}
	
					TheContext.textBaseline="bottom"; 
					
					for (var i=0;i<Lines.length;i++)
					{
						switch (Direction)
						{
						case "TL":
						case "L":
						case "BL":
							X=PixelLeft+MaxWidth-LineWidths[i];
							break;
						case "T":
						case "B":
						default: // centered
							X=PixelLeft+((MaxWidth-LineWidths[i])/2);
							break;
						case "BR":
						case "TR":
						case "R":
							X=PixelLeft;
							break;
						}
						TheContext.strokeText(Lines[i],X,Y);
						TheContext.fillText(Lines[i],X,Y);
							
						Y+=FontSize;
					}
				} // end if collision
				
			}
			if (LabelStyle!=undefined) TheView.RestoreStyle();
		}
	}
};
/*
* Paints a single ploy (polygon or polyline) into the view
* @protected
* @param TheView - the view to paint into
* @param FeatureIndex - the feature to paint
* @param TheCoordinates - Array of coordinate values of the form TheCoordinates[NumCoordinates][0=x,1=y]
* @param Closed - true to paint a polygon (closed), false for polyline (open)
* @param SelectedOnly - false unless we are drawing the selected point on top of everything else
* @param MouseOverOnly - false unless we are drawing the mouse over on top of everything else
*/
CMLayer.prototype.PaintRefArea=function(TheView,FeatureIndex,AreaCoordinates,TheType,SelectedOnly,MouseOverOnly)
{
	if (this.IsFeatureVisible(TheView,FeatureIndex))
	{
		var TheStyle=null;
		
		if (SelectedOnly)
		{
			TheStyle=this.GetStyle(TheView,0,"SelectedStyle");
		}
		else if (MouseOverOnly)
		{
			TheStyle=this.GetStyle(TheView,0,"MouseOverStyle");
		}
		else
		{
			TheStyle=this.GetFeatureSettingGroup("Style",FeatureIndex,null);
		}
		
		if (TheStyle!==null) { TheView.SetStyle(TheStyle,true); }
		
		var TheGeo=this.GetParent(CMGeo);
		
		//
		if ((TheGeo.GetProjectorType()==CMGeo.PROJECTOR_DYNAMIC)) // project and paint the area
		{
			var TheProjector=TheGeo.GetProjector();
			
			if (TheType==CMDatasetVector.TYPE_POLYGONS) // fill the area
			{
				var ProjectedAreaCoordinates=TheProjector.ProjectAreaFromGeographic(AreaCoordinates,TheType);
			
				TheView.PaintRefArea(ProjectedAreaCoordinates,true);
			}
			else
			{
				// stoke the area
				var ProjectedAreaCoordinates=TheProjector.ProjectAreaFromGeographic(AreaCoordinates,TheType);
			
				TheView.PaintRefArea(ProjectedAreaCoordinates,false,false,true);
			}
		}
		else // paint the area without project on the fly
		{
			if (TheType==CMDatasetVector.TYPE_POLYGONS) // fill the area
			{
				TheView.PaintRefArea(AreaCoordinates,true);
			}
			else
			{
				// stoke the area
				TheView.PaintRefArea(AreaCoordinates,false);
			}
		}
		if (TheStyle!==null) { TheView.RestoreStyle(TheStyle); }
	}
}

/**
* Should be called by default after a data set is loaded so the layer can have it's properties setup
* that are based on attributes.  Can be overriden by a caller or subclass.
* @override, @public
*/
// jjg - should be replaced by listener
CMLayer.prototype.OnLoad=function() 
{
	//this.UpdateSettingsFromAttributes();
	
	if (this.GetScene()==null)
	{
		alert("Sorry, you'll need to add the layer to the CanvasMap before you can load data.");
	}
	else 
	{
		this.GetScene().SetBoundsDirty();
		
		if (this.GetSetting("Layer","ZoomToBoundsOnLoad",false)==true)
		{
			var TheMainContainer=this.GetParent(CMMainContainer);
			
			TheMainContainer.ZoomToBounds(this.GetBounds());
		}
		
		this.GetScene().Repaint();
	}
}

//******************************************************************
// Mouse event handling
//******************************************************************
/*
* returns the feature index for the coordinate in projected space
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @returns FeatureIndex - -1 if the coordinate is not in a feature
*/
CMLayer.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	return(FeatureIndex);
};
/**
* Called when the mouse button is pressed down in a canvas.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @returns Used - true if the event was used, false otherwise.
*/
CMLayer.prototype.MouseDown=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if ((this.IsVisible(TheView))&&(this.GetSetting("Item","Status")>=CMItem.STATUS_SELECTABLE)&&
		((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT))) // check if we where clicked in
	{
		var FeatureIndex=this.In(TheView,RefX,RefY);
		
		if (FeatureIndex!=-1)
		{
			this.SetSelectedFeature(FeatureIndex);
			
			this.ShowInfoWindow(FeatureIndex,TheView,RefX,RefY);
			
			Used=true;
		}
	}
	return(Used);
};

/**
* Called when the mouse is moved over the canvas.  The layer should check if it
* can use the mouse over event and then return "true" if it used the event and
* "false" if it wants other layers to examine the event.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @param FeatureIndex - the feature the mouse has moved over.
*/
CMLayer.prototype.MouseMove=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	if (this.GetSetting("Item","Status")>=CMItem.STATUS_SELECTABLE)
	{
		var MouseOverSetting=this.GetSettingGroup("MouseOverStyle");
		
		// only check for "In" if the user has set something for the mouse over style
		if ((MouseOverSetting!=undefined)&&(Object.keys(MouseOverSetting).length>0)) // have something in the mouse over settings
		{
			var FeatureIndex=this.In(TheView,RefX,RefY);
			
			if (FeatureIndex!==-1) 
			{
				this.MouseOver(TheView,RefX,RefY,FeatureIndex);
			}
			else 
			{
				this.ResetMouseOverFeature();
			}
		}
	}
	return(Used);
};
/**
* Called when the mouse button is released.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @returns Used - true if the event was used, false otherwise.
*/
CMLayer.prototype.MouseUp=function(TheView,RefX,RefY) 
{
	var Used=false;
	
	return(Used);
};
/**
* Called when the mouse is moved over a feature.  Returns "true" if it used the event and
* "false" if it wants other layers to examine the event.
* @override
* @param TheView - the view with the size of the canvas.
* @param RefX - the horiziontal porition of the reference coordinate for the mouse cursor 
* @param RefY - the vertical porition of the reference coordinate for the mouse cursor 
* @param FeatureIndex - the feature the mouse has moved over.
* @returns Used - true if the event was used, false otherwise.
*/
CMLayer.prototype.MouseOver=function(TheView,RefX,RefY,FeatureIndex) 
{
	var Used=false;
	
	this.SetMouseOverFeature(FeatureIndex);
	
	return(Used);
};

//******************************************************************
// CMLayer Painting Functions
//******************************************************************
/**
* Called when the layer is resized
* @override
* @param TheView - the view with the size of the canvas.
*/
CMLayer.prototype.Resize=function(TheView) 
{
}

//******************************************************************
// CMLayer Projection On Fly Functions
//******************************************************************

CMLayer.prototype.ProjectBounds=function(Bounds) 
{
	var Result=Bounds; // sssume no change
	
	// see if the coordinates 
	var TheGeo=this.GetParent(CMGeo);
	
	if (TheGeo.GetProjectorType()==CMGeo.PROJECTOR_DYNAMIC)
	{
		var TheProjector=TheGeo.GetProjector();
		
		var Temp=TheProjector.ProjectToGeographic(Bounds.XMin,Bounds.YMin);
		
		Result.XMin=Temp[0];
		Result.YMin=Temp[1];
		
		var Temp=TheProjector.ProjectToGeographic(Bounds.XMax,Bounds.YMax);
		
		Result.XMax=Temp[0];
		Result.YMax=Temp[1];
	}
	return(Result);
}

CMLayer.prototype.ProjectCoordinate=function(RefX,RefY,Elevation) 
{
	var Result=[RefX,RefY,Elevation];
	
	// see if the coordinates 
	var TheGeo=this.GetParent(CMGeo);
	
	if (TheGeo.GetProjectorType()==CMGeo.PROJECTOR_DYNAMIC)
	{
		var TheProjector=TheGeo.GetProjector();
		
		Result=TheProjector.ProjectToGeographic(RefX,RefY,Elevation);
	}
	return(Result);
}
CMLayer.prototype.ProjectorChanged=function() 
{
	this.Repaint();
}
//******************************************************************
// CMLayer Search Functions
//******************************************************************

/*
* Requests search results from a layer.  The scene calls this function
* @override
* @param SearchPhrase - the phrase to search for in the layer's features
* @param ResultsPanel - the DOM element to put the results of the search into (i.e. set innerHTML)
*/
CMLayer.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
}
/*
* Requests search results from a layer.  The scene calls this function
* @override
* @param FeatureIndex - 
* @param TheView - 
* @param RefX - 
* @param RefY - 
*/
CMLayer.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	var TheHTML=this.GetFeatureSetting("Layer","InfoText",FeatureIndex,null);
	
	if (TheHTML!=null)
	{
		var InfoWindow=TheView.CreateInfoWindow("CMLayer.InfoWindow",RefX,RefY,this.GetInfoWindowWidth(),30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
};
/*
* Gets an icon for a specified mark.  This is used by subclasses.
* @override
* @protected
* @returns - an element that can be placed next to the layer in the layer list (should be 16x16)
*/
CMLayer.prototype.GetMarkIcon=function(MarkType,FillStyle,StrokeStyle)
{
	TheIcon=document.createElement('CANVAS');
	TheIcon.className="CM_LayerListIconClass";
	TheIcon.TheLayer=this;
	TheIcon.style.borderColor="rgba(0,0,0,0)";
	
	TheIcon.width=16; // jjg, these should be in settings eventually
	TheIcon.height=16;
	
	var TheView=new CMView2D();
	TheView.Setup(TheIcon);
	
	TheView.SetStyle({fillStyle:FillStyle,strokeStyle:StrokeStyle});
	
	// draw the mark
	
	var PixelX=0;
	var PixelY=0;
	var HalfSize=7;
	var HalfSize=7;
	var TheSize=14;
	
	switch (MarkType)
	{
	case CMLayer.MARK_CIRCLE:
		TheView.PaintCircle(PixelX+HalfSize+1,PixelY+HalfSize+1,HalfSize);
		break;
	case CMLayer.MARK_SQUARE:
		TheView.PaintRect(PixelX+1,PixelX+TheSize,PixelY+1,PixelY+TheSize);
		break;
	case CMLayer.MARK_TRIANGLE:
		{
			var Triangle=CMUtilities.GetRegularPolygon(3,HalfSize+2,HalfSize+1,-HalfSize-2, 180);
			TheView.PaintRefPoly(Triangle[0],Triangle[1],true);
		}
		break;
	case CMLayer.MARK_STAR:
		{
			var Star=CMUtilities.GetStar(5,TheSize,HalfSize+1,-HalfSize-1, 36);
			TheView.PaintRefPoly(Star[0],Star[1],true);
		}
		break;
	}
	return(TheIcon);
}
/*
* Gets an icon for a specified mark.  
* @override
* @protected
* @returns - an element that can be placed next to the layer in the layer list (should be 16x16)
*/
CMLayer.prototype.GetIcon=function()
{
	var TheIcon=this.GetSetting("IconImage","TheImage",1);
	
	if (TheIcon==1) // create an icon
	{
		var TheType=this.GetSetting("Mark","Type",CMLayer.MARK_SQUARE);
		
		var FillStyle=this.GetSetting("Style","fillStyle");
		var StrokeStyle=this.GetSetting("Style","strokeStyle");
		
		if (CMUtilities.IsDefined(TheType)==false) // does not have a mark, just draw a box that is colored the same 
		{
			TheIcon=document.createElement('div');
			TheIcon.className="CM_LayerListIconClass";
			TheIcon.TheLayer=this;
			
			if (CMUtilities.IsDefined(FillStyle))  TheIcon.style.backgroundColor=FillStyle;
			else TheIcon.style.backgroundColor=undefined;
			
			if (CMUtilities.IsDefined(StrokeStyle))  TheIcon.style.borderColor=StrokeStyle;
			else TheIcon.style.borderColor=undefined;
		}
		else // has a mark (circle, triangle, etc.)
		{
			TheIcon=this.GetMarkIcon(TheType,FillStyle,StrokeStyle);
		}
	}
	return(TheIcon);
}


CMLayer.prototype.AddMetadataMenuItem=function(ThePopupMenu)
{
	//********************************************
	// Add the metadata option if there is metadata
	
	var Metadata=this.GetSetting("Layer","Metadata",undefined);
	
	if (Metadata!=undefined)
	{
		var MetadataElement=document.createElement('div');
		MetadataElement.className="CM_LayerListPopupMenuItem";
		MetadataElement.setAttribute("id","CM_ZoomToExtentMenuItem");
		MetadataElement.innerHTML="Metadata";
		
		MetadataElement.TheLayer=this;
		
		MetadataElement.ThePopupMenu=ThePopupMenu;
		
		MetadataElement.addEventListener('click', function(event)
		{
			this.ThePopupMenu.style.visibility="hidden";
			
			var TheDialog=new CMDialog("CMMetadataDialog",400,200,false,"Metadata");
			
			// get the panel to add the label to
			var ThePanel=TheDialog.GetBodyElement();
			
			var Label=document.createElement("div");
			Label.style.margin="10px";
			Label.innerHTML=this.TheLayer.GetSetting("Layer","Metadata",undefined);
			ThePanel.appendChild(Label); // add the dialog element to the document

			event.stopPropagation();
		});
		ThePopupMenu.appendChild(MetadataElement);
	}
}
/*
* Allows the layer to customize the popup menu that apperas when the user right-clicks on the layer in the layer list
* @override
* @protected
* @param ThePopupMenu - 
*/
CMLayer.prototype.FillPopupMenu=function(ThePopupMenu)
{
	CMItem.PopupAddDelete(ThePopupMenu,this);
	
	//********************************************
	// create the delete menu item
/*	var DeleteElement=document.createElement('div');
	DeleteElement.setAttribute("id","CM_DeleteElementMenuItem");
	DeleteElement.className="CM_LayerListPopupMenuItem";
	
	DeleteElement.innerHTML="Delete";
	
	DeleteElement.TheLayer=this;
	DeleteElement.ThePopupMenu=ThePopupMenu;
	
	DeleteElement.addEventListener('click', function(event)
	{
		var TheParent=this.TheLayer.GetParent();
		
		this.ThePopupMenu.style.visibility= "hidden";
		var LayerIndex=TheParent.GetChildIndex(this.TheLayer);
		TheParent.RemoveChild(LayerIndex);
			
		event.stopPropagation();
	});
	
	ThePopupMenu.appendChild(DeleteElement);
*/	
	//********************************************
	// See if we should add the "Zoom to" option
	
	if (this.GetBounds()!=null)
	{
		var ZoomToElement=document.createElement('div');
		ZoomToElement.className="CM_LayerListPopupMenuItem";
		ZoomToElement.setAttribute("id","CM_ZoomToExtentMenuItem");
		ZoomToElement.innerHTML="Zoom To This Layer";
		
		ZoomToElement.TheLayer=this;
		
		ZoomToElement.ThePopupMenu=ThePopupMenu;
		
		ZoomToElement.addEventListener('click', function(event)
		{
			this.ThePopupMenu.style.visibility="hidden";
			
			var TheBounds=this.TheLayer.GetBounds();
			
			var TheScene=this.TheLayer.GetParent(CMScene);
												 
			var TheView=TheScene.GetView(0);
			
			TheView.ZoomToBounds(TheBounds);
			
			event.stopPropagation();
		});
		ThePopupMenu.appendChild(ZoomToElement);
	}
	
	this.AddMetadataMenuItem(ThePopupMenu);
	
	//********************************************
	// See if we should add the "Attribute Table" option
	
/*	var TheCanvasMap=this.GetParent(CMMainContainer);
	
	var AttributePanelElement=TheCanvasMap.GetElement(CanvasMap.ATTRIBUTE_PANEL);
	var NumRows=this.GetNumAttributeRows();
	
	if ((AttributePanelElement!=null)&&(NumRows>0))
	{
		var AttributeMenuItemElement=document.createElement('div');
		AttributeMenuItemElement.className="CM_LayerListPopupMenuItem";
		AttributeMenuItemElement.setAttribute("id","CM_AttributeMenuItem");
		AttributeMenuItemElement.innerHTML="Attribute Table";
		
		AttributeMenuItemElement.TheLayer=this;
		AttributeMenuItemElement.ThePopupMenu=ThePopupMenu;
		AttributeMenuItemElement.AttributePanelElement=AttributePanelElement;
		
		AttributeMenuItemElement.addEventListener('click', function(event)
		{
			this.ThePopupMenu.style.visibility="hidden";
			
			var TheCanvasMap=this.TheLayer.GetParent(CMMainContainer);
			 
			this.TheLayer.UpdateAttributeTable(this.AttributePanelElement);
			
			event.stopPropagation();
		});
		ThePopupMenu.appendChild(AttributeMenuItemElement);
	}*/
}

//CanvasMap/js/CMLayerDataset.js
/******************************************************************
* CMLayerDataset Class
*
* @module CMLayerDataset
* @Copyright HSU, Jim Graham, 2019
******************************************************************/

//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMLayerDataset.SettingDefintions=
{
	Dataset: 
	{ 
		URL: { Name:"URL",Type:CMBase.DATA_TYPE_STRING, Default:null }, // Full or partial URL to the dataset to load into the layer
		Format: { Name:"Format",Type:CMBase.DATA_TYPE_ENUMERATED,Options:[CMDataset.GEOJSON,CMDataset.PYRAMID,CMDataset.PYRAMID_OPEN_FORMAT,CMDataset.RASTER,CMDataset.SQL],Default:CMDataset.GEOJSON }, // Type of data to load.
		NorthPoleColor: { Name:"NorthPoleColor",Type:CMBase.DATA_TYPE_COLOR,Default:null}, // Color used to fill in the north pole for pyramid layers 
		SouthPoleColor: { Name:"SouthPoleColor",Type:CMBase.DATA_TYPE_COLOR,Default:null }, // Color used to fill in the south pole for pyramid layers 
	},
};

//******************************************************************
// CMLayerDataset Constructor
//******************************************************************
/*
* Constructor
* @protected, @constructs
*/
function CMLayerDataset() 
{
	CMLayer.call(this);
	
	this.TimeSlices[0].Settings.Dataset=	
	{
	};
	// Properties
	this.TheDataset=null; // default
	
	this.SetSetting("Item","Name","Dataset Layer");
}
CMLayerDataset.prototype=Object.create(CMLayer.prototype); // inherit prototype functions from PanelBase()

CMLayerDataset.prototype.contructor=CMLayerDataset; // override the constructor to go to ours

//**************************************************************
// CMItem Functions
//**************************************************************
CMLayerDataset.prototype.CMLayer_SetParent=CMLayer.prototype.SetParent;

CMLayerDataset.prototype.SetParent=function(NewParent)
{
	this.CMLayer_SetParent(NewParent);
	
	if (this.TheDataset!=null) this.TheDataset.SetParent(this.GetParent(CMScene));
}

/**
* Unselects all features in the layer.  
* @public
*/
CMLayerDataset.prototype.CMLayer_UnselectAll=CMLayer.prototype.UnselectAll;

CMLayerDataset.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMLayer_UnselectAll(SendMessageFlag);
	
	if ((this.TheDataset!=null)&&(this.TheDataset.GetSelectedFeature()!=-1)) // something is selected
	{ 
		this.TheDataset.UnselectAll(SendMessageFlag); // features are selected in the dataset
	}
}
CMLayerDataset.prototype.CMLayer_SetVisible=CMLayer.prototype.SetVisible;

CMLayerDataset.prototype.SetVisible=function(Flag) 
{
	this.CMLayer_SetVisible(Flag);
	
	if (this.TheDataset!=null) // something is selected
	{ 
		this.TheDataset.SetVisible(this,Flag);
	}
}

//**************************************************************
// CMItem Functions for painting
//**************************************************************

/*
* Paints a layer into the canvas.  This function is provided for 
* subclasses to override.  The code below shows the sequence of steps
* a layer class should take to paint itself into the canvas.
* @override
* @param TheView - the view to paint into.
*/
CMLayerDataset.prototype.Paint=function(TheView) 
{
	if ((this.IsVisible(TheView))&&(this.TheDataset!=null))
	{
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!==null) { TheView.SetStyle(TheStyle); }
		
		this.TheDataset.Paint(this,TheView,false);
		
		if (TheStyle!==null) { TheView.RestoreStyle(); }
	}
}
/**
* Just paint the selected features.  This is called after all the other features have
* been painted to paint the selected features on top
* @override
* @param TheView - the view to paint into.
*/
CMLayerDataset.prototype.PaintSelected=function(TheView) 
{
	if ((this.IsVisible(TheView))&&(this.TheDataset!=null))
	{
		// paint mouse over only if the style was set
		var TheStyle=this.GetStyle(TheView,undefined,"MouseOverStyle");
		
		if (CMUtilities.IsDefined(TheStyle)) 
		{ 
			TheView.SetStyle(TheStyle);
		
			this.TheDataset.Paint(this,TheView,false,true);
		
			TheView.RestoreStyle();
		}
		// paint the selected features only if the style was set
		var TheStyle=this.GetStyle(TheView,undefined,"SelectedStyle");
		
		if (CMUtilities.IsDefined(TheStyle)) 
		{ 
			TheView.SetStyle(TheStyle);
		
			this.TheDataset.Paint(this,TheView,true);
		
			TheView.RestoreStyle(); 
		}
	}
}

//**************************************************************
// CMBase Functions
//**************************************************************

CMLayerDataset.prototype.CMLayer_GetSettingsDefinitions=CMLayer.prototype.GetSettingsDefinitions;

CMLayerDataset.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMLayer_GetSettingsDefinitions();
	
	for (Key in CMLayerDataset.SettingDefintions)
	{
		Result[Key]=CMLayerDataset.SettingDefintions[Key];
	}
	return(Result); 
}

//**************************************************************
// CMLayer Functions
//**************************************************************
/**
* Check if the feature is visible in the view.
* This should be called by subclasses but can also be called to limit a layer's bounds after loading.
* @public
* @param NewBounds - Object for Bounds with format {XMin,XMax,YMin,YMax}
*/
CMLayerDataset.prototype.SetBounds=function(NewBounds) 
{
	if (this.GetDataset()!=undefined) 
	{
		this.GetDataset().SetBounds(NewBounds);
	
		var TheScene=this.GetParent(CMScene);
		TheScene.SetBoundsDirty();
	}
}
/**
* Returns the bounds of the data within the layer.  Computed after loading the data.
* @public
* @returns Bounds - with format {XMin,XMax,YMin,YMax}
*/
CMLayerDataset.prototype.GetBounds=function() 
{
	var TheBounds=undefined;
	
	if (this.GetDataset()!=undefined) 
	{
		TheBounds=this.GetDataset().GetBounds();
		
		TheBounds=this.ProjectBounds(TheBounds);
	}
	return(TheBounds);
}

CMLayerDataset.prototype.SetProjector=function(NewProjector)
{
	this.TheProjector=NewProjector;
	if (this.TheDataset!=null) 
	{
		this.TheDataset.SetProjector(NewProjector); // jjg temp kludge
	}
}

CMLayerDataset.prototype.GetProjector=function()
{
	var Result=null;
	
	if (this.TheDataset!=null) 
	{
		Result=this.TheDataset.GetProjector(); // jjg temp kludge
	}
	return(Result);
}
//**************************************************************
// CMLayer functions for features
//**************************************************************

/**
* Sets the feature that is selected
* @public
* @param NewFeatureIndex - >=0 indicates a feature, -1 is for none.
*/
CMLayerDataset.prototype.SetSelectedFeature=function(New) 
{
	if ((this.TheDataset!=null)&&(New!=this.TheDataset.GetSelectedFeature()))
	{
		this.TheDataset.SetSelectedFeature(New); // sends message
		
		// call the scene to let everyone know the selection changed
		var TheScene=this.GetParent(CMScene);
		
		TheScene.SelectionChanged(this);
	}
}
/**
* Sets the current feature that the mouse is over
* @public
* @param NewFeatureIndex - index to the feature the mouse is over (typcially returned by In())
*/
CMLayerDataset.prototype.SetMouseOverFeature=function(New) 
{
	if ((this.TheDataset!=null)&&(this.TheDataset.GetMouseOverFeature()!=New)) // something is selected
	{ 
		this.TheDataset.SetMouseOverFeature(New);
	}
}
/**
* Sets the current mouse over feature to none (i.e. -1);
* @protected
* @returns FeatureIndex - index to the feature the mouse is over (typcially returned by In()), or -1 for none
*/
CMLayerDataset.prototype.ResetMouseOverFeature=function() 
{
	if ((this.TheDataset!=null)&&(this.TheDataset.GetMouseOverFeature()!=-1)) // something is selected
	{ 
		this.TheDataset.SetMouseOverFeature(-1);
	}
}
//**************************************************************
// CMLayer functions for feature interaction
//**************************************************************

CMLayerDataset.prototype.In=function(TheView,RefX,RefY) 
{
	var FeatureIndex=-1;
	
	if (this.TheDataset!=null)
	{
		// project the coordinates back to geographic if needed
		var Result=this.ProjectCoordinate(RefX,RefY);
		
		if (Result!=null)
		{
			RefX=Result[0];
			RefY=Result[1];
		
			var RefTolerance=this.GetRefTolerance(TheView);
			
			var NumFeatures=this.TheDataset.GetNumFeatures();
			
			for (var i=0;( i < NumFeatures)&&(FeatureIndex==-1); i++) 
			{
				var Status=this.GetFeatureSetting("Item","Status",i,true);
				
				if (Status>=CMItem.STATUS_VISIBLE)
				{
					var Result=this.TheDataset.InFeature(TheView,RefX,RefY,i,RefTolerance);

					if (Result) 
					{
						FeatureIndex=i;
					}
				}
			}
			var FeatureIndex=this.TheDataset.In(TheView,RefX,RefY,RefTolerance);
		}
	}
	return(FeatureIndex);
};
//******************************************************************
// CMLayer Search Functions
//******************************************************************

CMLayerDataset.prototype.GetSearchResults=function(SearchPhrase,ResultsPanel) 
{
	if ((this.IsVisible())&&(this.TheDataset!=null))
	{
		this.TheDataset.GetSearchResults(SearchPhrase,ResultsPanel);
	}
}
/*
* returns the icon for the layer list
* @override
* @protected
* @returns - an element that can be placed next to the layer in the layer list (should be 16x16)
*/
CMLayerDataset.prototype.CMLayer_GetIcon=CMLayer.prototype.GetIcon;

CMLayerDataset.prototype.GetIcon=function()
{
	var TheIcon=this.CMLayer_GetIcon();
	
	if (this.TheDataset!=null)
	{
		TheIcon=this.TheDataset.GetIcon(this,TheIcon);
	}
	return(TheIcon);
}

//**************************************************************
// CMLayer functions
//**************************************************************
/*
* Called to obtain the data for the layer from a URL.
*
* @override, @public
*/
CMLayerDataset.prototype.RequestData=function() 
{
	var URL=this.GetSetting("Dataset","URL",null);
	var Format=this.GetSetting("Dataset","Format",CMDataset.GEOJSON);
	this.SetURL(URL,Format);
}
//**************************************************************
// CMLayerDataset functions for managing the dataset
//**************************************************************
/*
* Called to obtain the data for the layer from a URL.
* Depricated, use:
*	- SetSetting("Dataset","URL",URL);
*	- SetSetting("Dataset","Format",Format);
*	- RequestData()
*
* @protected
* @param URL - the URL to use to obtain data
* @param DataSetType - optional data set type (GeoJSON is the default)
*/
CMLayerDataset.prototype.SetURL=function(URL,DataSetType) 
{
	var TheScene=this.GetParent(CMScene);
	
	// create the new data set or get an existing one
	if (this.TheDataset==null)
	{
		var TheDataset=CMDataset.GetDataObject(URL,DataSetType);
		this.SetDataset(TheDataset);
	}
									 
	// Call the layer's OnLoad() function when the dataset loads the data
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_TILE_LOADED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		//ThisLayer.OnLoad(); this is just a tile loading so we just repaint the scene
		ThisLayer.GetScene().Repaint();
	});
									 
	// Call the layer's OnLoad() function when the dataset loads the data
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_LOADED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.OnLoad();
		ThisLayer.GetScene().LayerListChanged(); // jjg - a bit of a hack to get the layer list to repaint once we have the data (i.e. can determine if the GeoJSON data is string).
		// setup any properties that were set by attributes
		if (ThisLayer.SettingsAttributes!=null)
		{
			// go through all the properties that come from attributes
			for (var SettingsGroupKey in ThisLayer.SettingsAttributes)
			{
				var SettingsGroup=ThisLayer.SettingsAttributes[SettingsGroupKey];
				
				for (var SettingsKey in SettingsGroup)
				{
					var AttributeName=SettingsGroup[SettingsKey];
					
					var Index=TheDataset.GetAttributeIndexFromHeading(AttributeName);
					
					if (Index==-1) CMMainContainer.Error("Sorry, the attribute "+AttributeName+" was not found");
					else TheDataset.LoadAttributeColumn(Index);
				}
			}
		}
	});
	// Make sure the scene is repained when the selection changes
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_SELECTION_CHANGED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.GetScene().SelectionChanged(TheDataset);
//		ThisLayer.GetScene().Repaint();
	});
	
	// Make sure the scene is repained when the mouse over changes
	this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_MOUSE_OVER_FEATURE_CHANGED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.GetScene().Repaint();
	});
	/*this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_TILE_LOADED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		ThisLayer.OnLoad();
		ThisLayer.GetScene().Repaint();
	});
	*/
	// add a listener for when the attributes change
	// if there are settings that are based on an attribute, we need to update the settings here.
	this.TheDataset.AddListener(CMDataset.MESSAGE_ATTRIBUTES_CHANGED,this,function(TheDataset,ThisLayer,AdditionalInfo)
	{
		// setup any properties that were set by attributes
		if (ThisLayer.SettingsAttributes!=null)
		{
			// go through all the properties that come from attributes
			for (var SettingsGroupKey in ThisLayer.SettingsAttributes)
			{
				var SettingsGroup=ThisLayer.SettingsAttributes[SettingsGroupKey];
				
				for (var SettingsKey in SettingsGroup)
				{
					var AttributeName=SettingsGroup[SettingsKey];
				
					var ColumnIndex=TheDataset.GetAttributeIndexFromHeading(AttributeName);
					
					if (ColumnIndex==-1)
					{
						var TheMainContainer=ThisLayer.GetParent(CMMainContainer);
						CMMainContainer.Error("Sorry, the attribute "+AttributeName+" in "+ThisLayer.GetName()+" is not available");
					}
					else
					{
						var NumRows=TheDataset.GetNumAttributeRows();
						
						for (var j=0;j<NumRows;j++)
						{
							if (NumRows!=TheDataset.GetNumAttributeRows())
							{
								var test=12;
							}
							var Value=TheDataset.GetAttributeCell(ColumnIndex,j);
						
							if ((Value!==undefined)&&(Value!==""))
							{
								if ((SettingsGroupKey=="IconImage")&&(SettingsKey=="URL"))
								{
									var TheImage;  //=JSON.parse(Value); // image object with the URL
									TheImage=new Image(); 
									TheImage.Loaded=false;
									TheImage.TheLayer=this;
									
									TheImage.onload=function() 
									{ 
										This.Loaded=true;
				
										This.TheLayer.Repaint(); 
									};
									TheImage.src=Value; 
								}
								else if ((SettingsGroupKey=="Mark")&&(SettingsKey=="Type"))
								{
									if (Value==="MARK_CIRCLE") Value=CMLayer.MARK_CIRCLE;
									if (Value==="MARK_TRIANGLE") Value=CMLayer.MARK_TRIANGLE;
									if (Value==="MARK_SQUARE") Value=CMLayer.MARK_SQUARE;
									if (Value==="MARK_STAR") Value=CMLayer.MARK_STAR;
								}
								else if ((SettingsGroupKey=="Mark")&&(SettingsKey=="Size"))
								{
									Value=parseInt(Value);
								}
								else // all others are HTML 5 Canvas Styles
								{
									Value=Value;
								}
								ThisLayer.SetFeatureSetting(SettingsGroupKey,SettingsKey,j,Value);
								
								if (ThisLayer.CallbackFunction!=undefined) ThisLayer.CallbackFunction(ThisLayer.CallbackParameters);
							}
						}
					}
				}
			}
			ThisLayer.SendMessageToListeners(CMBase.MESSAGE_SETTINGS_CHANGED,null);
		}
	});
	
	// add a projector if one is provided
//	if (TheProjector!=undefined) this.TheDataset.SetProjector(TheProjector);
	
	// load the main dataset
	this.TheDataset.SetURL(URL);

}
/*
* Set existing data into the layer.  Allocates a CMDataset object if needed.
* @public
* @param TheData - the URL to use to obtain data
* @param DataSetType - optional data set type (GeoJSON is the default)
*/
CMLayerDataset.prototype.SetData=function(TheData,DataSetType) 
{
	// create the new data set or get an existing one
	var TheScene=this.GetParent(CMScene);
	
	var NewDataset=CMDataset.GetDataObject(null,DataSetType);
	
	this.SetDataset(NewDataset);
	
	this.TheDataset.SetData(TheData);
};
/*
* Gets the dataset from this object.  Allocates the dataset if it has not already
* been allocated.
* @public
* @returns TheDataset - the data set associated with the layer or null for none
*/
CMLayerDataset.prototype.GetDataset=function() 
{
	if (this.TheDataset==null)
	{
		var Format=this.GetSetting("Dataset","Format",null);
		
		if (Format!=null)
		{
			var TheDataset=CMDataset.GetDataObject(null,Format);
			
			this.SetDataset(TheDataset);
		}
	}
	
	return(this.TheDataset);
};
/*
* Sets the dataset for this layer to get data from
* @public
* @param NewDataset - the new dataset
*/
CMLayerDataset.prototype.SetDataset=function(NewDataset) 
{
	this.TheDataset=NewDataset;
	
	if (this.TheDataset!=null) 
	{
		this.TheDataset.SetParent(this.GetParent(CMScene));
		
		this.TheDataset.SetVisible(this,this.GetVisible());
		
		this.TheDataset.AddListener(CMDataset.MESSAGE_DATASET_LOADED,this,function(TheDataset,ThisLayer,AdditionalInfo)
		{
			ThisLayer.OnLoad();
		});
		if (this.TheProjector!=undefined) this.TheDataset.SetProjector(this.TheProjector);
	}
};

//CanvasMap/js/CMLayerGraticule.js
/******************************************************************************************************************
* CMLayerGraticule
*
* by: Jim Graham
* 
* This class required a level of complexity beyond what I initially expected.
* The problem is that we have to:
*	- Draw graticule lines based on the zoom level, projection, and area viewed
*  - Paint coordinates along the border based on where the graticules intersect with the border
*  - Paint coordinates along the outside of the graticule grid if it is visible (i.e. does not 
*    intersect with the border.
*
* Graticles are made visible by setting the overall style to transparent.  The graticules must be drawn to get the intersections for the exterior and border
*
* @module CMLayerGraticule 
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/

CMLayerGraticule.MAX_SPACING_DEGREES=15;

/**
* Below are the additional settings definitions for STLayers.  Setings for the basic drawing style and text
* style are inherited from STItem
* @public, @settings
*/
CMLayerGraticule.SettingDefintions=
{
	Graticule: // actual graticules within the map
	{
		East: { Name:"East",Type:CMBase.DATA_TYPE_FLOAT, Default:-180 },
		West: { Name:"West",Type:CMBase.DATA_TYPE_FLOAT, Default:180 },
		North: { Name:"North",Type:CMBase.DATA_TYPE_FLOAT, Default:90 },
		South: { Name:"South",Type:CMBase.DATA_TYPE_FLOAT, Default:-90 },
		Spacing: { Name:"Spacing",Type:CMBase.DATA_TYPE_FLOAT, Default:200 }, /// desired spacing for the graticules in pixels
		DegreeSpacing: { Name:"Degree Spacing",Type:CMBase.DATA_TYPE_FLOAT, Default:-1 }, // only implemented for 3d 
		TextSpacing: { Name:"Text Spacing",Type:CMBase.DATA_TYPE_FLOAT, Default:360 }, // only implemented for 3d 
	},
	Border: // area around the outside of them map (covers the edges of the map)
	{
		// standard HTML 5 settings except the defaults may change and sometimes the available settings will change between each settings group
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:3 },
		BorderWidth: { Name:"Border Width",Type:CMBase.DATA_TYPE_FLOAT, Default:12 },
	},
	BorderText: // coordinates along the border when the map intersects with the border
	{
		font: { Name:"Font",Type:CMBase.DATA_TYPE_FONT, Default:"14px Arial" },
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
	},
};
//**************************************************************************************************
// Constructor
//**************************************************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMLayerGraticule() 
{
	CMLayer.call(this);
	
	// 
	this.TimeSlices[0].Settings.Graticule=	
	{
	};
	this.TimeSlices[0].Settings.Border=	
	{
	};
	this.TimeSlices[0].Settings.BorderText=	
	{
	};
	//***********************************************
	// temp properties for the currnet clipping box setup in SetupBoundsPoly()
	
	this.Bounds=null;
	//this.BoundsSpacing=10;
	
	//***********************************************
	// Temp properties for finding the min/max lat/lon for the graticules
	
	// coordinates for the bounds in the current projection
	this.ClippingBoxProjectedEastings=null;
	this.ClippingBoxProjectedNorthings=null;
	
	this.ClippingBoxProjectedWestCoordinates=null;
	this.ClippingBoxProjectedEastCoordinates=null;
	
	this.ClippingBoxProjectedNorthCoordinates=null;
	this.ClippingBoxProjectedSouthCoordinates=null;
	
	//***********************************************
	// intersections between the graticules (lines) and the sides of the border
	this.TopIntersectionCoordinates=null;
	this.BottomIntersectionCoordinates=null;
	
	this.LeftIntersectionCoordinates=null;
	this.RightIntersectionCoordinates=null;
	
	//********************************************************
	this.Lines3D=null;
	
	this.SetSetting("Item","Name","Graticules");
}
CMLayerGraticule.prototype=Object.create(CMLayer.prototype); // inherit prototype functions from PanelBase()

CMLayerGraticule.prototype.contructor=CMLayerGraticule; // override the constructor to go to ours
//******************************************************************
// Private definitions
//******************************************************************
/*
* These are the posible options for the intervals between values on the border.
*/
CMLayerGraticule.DegreeQuantized=[
	 30, // 30 degrees
	 15,
	 10,
	 5,
	 2,
	 1,
	 0.5, // 30 minutes
	 0.25, // 15 minutes
	 1/6, // 10 minutes
	 1/12, // 5 minutes
	 1/30, // 2 minutes
	 1/60, // 1 minute
	 1/120, // 30 seconds
	 1/240, // 15 seconds
	 1/360, // 10 seconds
	 1/720, // 5 seconds
	 1/1800, // 2 seconds
	 1/3600 // 1 second
];

//******************************************************************
// Private Functions for computing the dimensions of a set of graticules
// that match the viewing area
//******************************************************************

/**
* Find the coordinate where a general line segment intersects a vertical line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @param P1X - horiziontal value of the first coordinate for the line segment
* @param P1Y - vertical value of the first coordinate for the line segment
* @param P2X - horiziontal value of the second coordinate for the line segment
* @param P2Y - vertical value of the second coordinate for the line segment
* @param RefX - horiziontal value of the vertical line segment
* @param RefTop - top of the vertical line segment
* @param RefBottom - bottom of the vertical line segment
* @param Coordinates - array that will collect the intersections with the vertical line segment
* @param Latitude - latitude to be added so we can label the intersection on the border.
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.SegmentIntersectsAVertical=function(P1X,P1Y,P2X,P2Y,RefX,RefTop,RefBottom,Coordinates,Latitude)
{
	var Result=null;
	
	if (((P1X<RefX)&&(P2X<RefX))||((P1X>RefX)&&(P2X>RefX))|| //segment is to one side
		((P1Y<RefBottom)&&(P2Y<RefBottom))||((P1Y>RefTop)&&(P2Y>RefTop))) // segement is above or below 
	{
	}
	else // segment's bounding rectangle overlaps the vertical segement
	{
		if (P2X==P1X) // vertical line
		{
			if (P1X==RefX)  // colinear
			{
	//			Result=[RefX,RefTop]; // vertical colinear with the vertical (not sure of correct Y value)
				Coordinates.push({Easting:RefX,Northing:P1Y});
			}
		}
		else if (P1X==P2X) // vertical line
		{
			// already know the line is in the same box as the horiziontal so it must intersect
			Coordinates.push({Easting:RefX,Northing:P1Y,Longitude:Longitude});
		}
		else
		{
			// find the equation of the line
			var m=(P2Y-P1Y)/(P2X-P1X); // y=mx+b, b=y-mx
			var b=P1Y-(m*P1X);
			
			// find the intersection with our vertical
			
			var y=m*RefX+b;
			if ((y<RefTop)&&(y>RefBottom)) 
			{
				Coordinates.push({Easting:RefX,Northing:y,Latitude:Latitude});
			}
		}
	}
	return(Result);
}
/**
* Find the coordinate where a general line segment intersects a horizontal line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @P1X - horiziontal value of the first coordinate for the line segment
* @P1Y - vertical value of the first coordinate for the line segment
* @P2X - horiziontal value of the second coordinate for the line segment
* @P2Y - vertical value of the second coordinate for the line segment
* @RefLeft - left value of the horizontal line segment
* @RefRight - right value of the horizontal line segment
* @RefY - vertical value of the horizontal line segment
* @Coordinates - array that will collect the intersections with the vertical line segment
* @Longitude - latitude to be added so we can label the intersection on the border.  Optional
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.SegmentIntersectsAHorizontal=function(P1X,P1Y,P2X,P2Y,RefLeft,RefRight,RefY,Coordinates,Longitude)
{
	var Result=null;
	
	if (((P1X<RefLeft)&&(P2X<RefLeft))||((P1X>RefRight)&&(P2X>RefRight))|| //segment is to one side
		((P1Y<RefY)&&(P2Y<RefY))||((P1Y>RefY)&&(P2Y>RefY))) // segement is above or below 
	{
	}
	else // segment's bounding rectangle overlaps the vertical segement
	{
		if (P2Y==P1Y) // horizontal line
		{
			if (P1Y==RefY) // colinear
			{
	//			Result=[RefX,RefTop]; // vertical colinear with the vertical (not sure of correct Y value)
				
				Coordinates.push({Easting:P1X,Northing:RefY,Longitude:Longitude});
			}
		}
		else if (P1X==P2X) // vertical line
		{
			// already know the line is in the same box as the horiziontal so it must intersect
			Coordinates.push({Easting:P1X,Northing:RefY,Longitude:Longitude});
/*			if ((P1X<=RefRight)&&(P1X>=RefLeft)) 
			{
				Coordinates.push({Easting:RefLeft,Northing:RefY,Longitude:Longitude});
			}
*/		}
		else
		{
			// find the equation of the line
			var m=(P2Y-P1Y)/(P2X-P1X); // y=mx+b, b=y-mx
			var b=P1Y-(m*P1X);
			
			// find the intersection with our vertical
			
			var x=(RefY-b)/m; // x=(y-b)/m
			if ((x>=RefLeft)&&(x<=RefRight)) 
			{
				Coordinates.push({Easting:x,Northing:RefY,Longitude:Longitude});
			}
		}
	}
	return(Result);
}
/**
* Find the coordinates where a general polygon intersects a vertical line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @Xs - X values for the polygons coordinates
* @Ys - Y values for the polygons coordinates
* @RefX - horiziontal value of the vertical line segment
* @RefTop - top of the vertical line segment
* @RefBottom - bottom of the vertical line segment
* @Coordinates - array that will collect the intersections with the vertical line segment
* @Longitude - latitude to be added so we can label the intersection on the border.  Optional
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.GetPolyIntersectionsWithVertical=function(Xs,Ys,RefLeft,RefTop,RefBottom,Coordinates)
{
	var Result=null;
	
	var LastIndex=Xs.length-1;
	
	for (var i=0;(i<LastIndex);i++)
	{
		Result=CMLayerGraticule.SegmentIntersectsAVertical(Xs[i],Ys[i],Xs[i+1],Ys[i+1],RefLeft,RefTop,RefBottom,Coordinates);
	}
	Result=CMLayerGraticule.SegmentIntersectsAVertical(Xs[LastIndex],Ys[LastIndex],Xs[0],Ys[0],RefLeft,RefTop,RefBottom,Coordinates);
	return(Result);
}
/**
* Find the coordinates where a general polygon intersects a horizontal line segment.
* This is provided because it is much faster than finding the intersection
* of two line segments.
* @private
* @Xs - X values for the polygons coordinates
* @Ys - Y values for the polygons coordinates
* @RefLeft - left value of the horizontal line segment
* @RefRight - right value of the horizontal line segment
* @RefY - vertical value of the horizontal line segment
* @Coordinates - array that will collect the intersections with the vertical line segment
* @Longitude - latitude to be added so we can label the intersection on the border.  Optional
* @return - JSON object with {Easting:RefX,Northing:RefTop} if an intersection was found, null otherwise
*/
CMLayerGraticule.GetPolyIntersectionsWithHorizontal=function(Xs,Ys,RefLeft,RefRight,RefY,Coordinates)
{
	var Result=null;
	
	var LastIndex=Xs.length-1;
	
	for (var i=0;(i<LastIndex);i++)
	{
		Result=CMLayerGraticule.SegmentIntersectsAHorizontal(Xs[i],Ys[i],Xs[i+1],Ys[i+1],RefLeft,RefRight,RefY,Coordinates);
	}
	Result=CMLayerGraticule.SegmentIntersectsAHorizontal(Xs[LastIndex],Ys[LastIndex],Xs[0],Ys[0],RefLeft,RefRight,RefY,Coordinates);
	
	return(Result);
}
/**
* Get the max bounds for the projector then make it smaller if specified by the user.
* @private
*//*
CMLayerGraticule.prototype.SetupBounds=function(ClippingPoly)
{
	var Xs=ClippingPoly.Xs;
	var Ys=ClippingPoly.Ys;
	
	this.Bounds={};
	
	ClippingPoly.Xs[1]=this.GetSetting("Graticule","East",Xs[1]);
	ClippingPoly.Xs[0]=this.GetSetting("Graticule","West",Xs[0]);
	ClippingPoly.Ys[0]=this.GetSetting("Graticule","North",Ys[0]);
	ClippingPoly.Ys[1]=this.GetSetting("Graticule","South",Ys[1]);
}*/
CMLayerGraticule.prototype.AddEastWestCoordinate=function(TheProjector,Latitude,BoundsWest,BoundsEast)
{
	var WestResult=TheProjector.ProjectFromGeographic(BoundsWest,Latitude);
	var EastResult=TheProjector.ProjectFromGeographic(BoundsEast,Latitude);
	
	if (WestResult!=null)
	{
		var WestCoordinate={Easting:WestResult[0],Northing:WestResult[1]};
		
		this.ClippingBoxProjectedWestCoordinates.push(WestCoordinate);
	}
	if (EastResult!=null)
	{
		var EastCoordinate={Easting:EastResult[0],Northing:EastResult[1]};
		
		this.ClippingBoxProjectedEastCoordinates.push(EastCoordinate);
	}
}
CMLayerGraticule.prototype.AddNorthSouthCoordinate=function(TheProjector,Longitude,BoundsNorth,BoundsSouth)
{
	var NorthResult=TheProjector.ProjectFromGeographic(Longitude,BoundsNorth);
	var SouthResult=TheProjector.ProjectFromGeographic(Longitude,BoundsSouth);
	
	if (NorthResult!=null)
	{
		var NorthCoordinate={Easting:NorthResult[0],Northing:NorthResult[1]};
		
		this.ClippingBoxProjectedNorthCoordinates.push(NorthCoordinate);
	}
	if (SouthResult!=null)
	{
		var SouthCoordinate={Easting:SouthResult[0],Northing:SouthResult[1]};
	
		this.ClippingBoxProjectedSouthCoordinates.push(SouthCoordinate);
	}
}
//******************************************************************
// Functions for finding the valid area to render
//******************************************************************

/**
* Approach:
* - Gets the bounds from the projector (North,South,East,West)
* - Create a temp series of coordinates that are for the north, south, east, and west edges of the specified clipping box
* - Convert the edge coordintes into a series:
*  - this.ClippingBoxProjectedEastings[]
*  - this.ClippingBoxProjectedNorthings[]
*
*  - this.ClippingBoxProjectedNorthCoordinates[]
*  - this.ClippingBoxProjectedWestCoordinates[]
*  - this.ClippingBoxProjectedNorthCoordinates[]
*  - this.ClippingBoxProjectedSouthCoordinates[]
* @private
*/
CMLayerGraticule.prototype.SetupBoundsPoly=function(ClippingPoly)
{
//	if (this.ClippingBoxProjectedEastings===null) // bounds have not been setup
	{
		// get the desired spacing (max)
		var BoundsSpacing=CMLayerGraticule.MAX_SPACING_DEGREES;
		
		// make sure we have a projector
		var TheGeo=this.GetParent(CMGeo);
		
		var TheProjector=TheGeo.GetProjector();
			
		// initialize bounds poly (coordinates to go around the bounds)
		this.ClippingBoxProjectedEastings=[];
		this.ClippingBoxProjectedNorthings=[];
		
		// 
		this.ClippingBoxProjectedWestCoordinates=[];
		this.ClippingBoxProjectedEastCoordinates=[];
		
		this.ClippingBoxProjectedNorthCoordinates=[];
		this.ClippingBoxProjectedSouthCoordinates=[];
	
		//*************************************************************************************
		// go from the south to the north adding coordinates to the east and west coordinate arrays
		
		var XMinMax=CMUtilities.GetMinMax(ClippingPoly.Xs);
		var YMinMax=CMUtilities.GetMinMax(ClippingPoly.Ys);

		var Latitude=YMinMax.Min;
		var Range=YMinMax.Max-YMinMax.Min;
		var Factor=Range/10;
		
		for (var i=0;i<=10;i++)
		{
			this.AddEastWestCoordinate(TheProjector,Latitude,XMinMax.Min,XMinMax.Max);
			
			Latitude+=Factor; // change the latitude to be on a BoundsSpacing line
		}
		
		var StartingRemainder=Latitude%BoundsSpacing;
		
		if (StartingRemainder!=0) // have some extra stuff in the south
		{
			this.AddEastWestCoordinate(TheProjector,Latitude,XMinMax.Min,XMinMax.Max);
			
			Latitude=Latitude-StartingRemainder; // change the latitude to be on a BoundsSpacing line
		}
		while (Latitude<=YMinMax.Max)
		{
			this.AddEastWestCoordinate(TheProjector,Latitude,XMinMax.Min,XMinMax.Max);
			
			Latitude+=BoundsSpacing;
		}
		var EndingRemainder=YMinMax.Max%BoundsSpacing;
		
		if (EndingRemainder!=0) // have some extra stuff in the south
		{
			Latitude=YMinMax.Max;
		
			this.AddEastWestCoordinate(TheProjector,Latitude,XMinMax.Min,XMinMax.Max);
		}
		
		//*************************************************************************************
		// go from the south to the north adding coordinates to the east and west coordinate arrays
		
		var Longitude=XMinMax.Min;
		var Range=XMinMax.Max-XMinMax.Min;
		var Factor=Range/10;
		
		for (var i=0;i<=10;i++)
		{
			this.AddNorthSouthCoordinate(TheProjector,Longitude,YMinMax.Max,YMinMax.Min);
			
			Longitude+=Factor;
		}
		var StartingRemainder=Longitude%BoundsSpacing;
		
		if (StartingRemainder!=0) // have some extra stuff in the south
		{
			this.AddNorthSouthCoordinate(TheProjector,Longitude,YMinMax.Max,YMinMax.Min);
			
			Longitude=Longitude-StartingRemainder;
		}
		while (Longitude<=XMinMax.Max) 
		{
			this.AddNorthSouthCoordinate(TheProjector,Longitude,YMinMax.Max,YMinMax.Min);
			
			Longitude+=BoundsSpacing;
		}
		var EndingRemainder=XMinMax.Max%BoundsSpacing;
		
		if (EndingRemainder!=0) // have some extra stuff in the south
		{
			Longitude=XMinMax.Max;
		
			this.AddNorthSouthCoordinate(TheProjector,Longitude,YMinMax.Max,YMinMax.Min);
		}
		
		// make the max bounds into two x and y arrays
		
		for (var i=0;i<this.ClippingBoxProjectedWestCoordinates.length;i++) // south to north along the left side
		{
			this.ClippingBoxProjectedEastings.push(this.ClippingBoxProjectedWestCoordinates[i].Easting);
			this.ClippingBoxProjectedNorthings.push(this.ClippingBoxProjectedWestCoordinates[i].Northing);
		}
		for (var i=0;i<this.ClippingBoxProjectedNorthCoordinates.length;i++) // weat to east along the top
		{
			this.ClippingBoxProjectedEastings.push(this.ClippingBoxProjectedNorthCoordinates[i].Easting);
			this.ClippingBoxProjectedNorthings.push(this.ClippingBoxProjectedNorthCoordinates[i].Northing);
		}
		for (var i=0;i<this.ClippingBoxProjectedEastCoordinates.length;i++) // north to south down the right side
		{
			var Index=this.ClippingBoxProjectedEastCoordinates.length-1-i;
			
			this.ClippingBoxProjectedEastings.push(this.ClippingBoxProjectedEastCoordinates[Index].Easting);
			this.ClippingBoxProjectedNorthings.push(this.ClippingBoxProjectedEastCoordinates[Index].Northing);
		}
		for (var i=0;i<this.ClippingBoxProjectedSouthCoordinates.length;i++) // east to west across the bototm
		{
			var Index=this.ClippingBoxProjectedSouthCoordinates.length-1-i;
			
			this.ClippingBoxProjectedEastings.push(this.ClippingBoxProjectedSouthCoordinates[Index].Easting);
			this.ClippingBoxProjectedNorthings.push(this.ClippingBoxProjectedSouthCoordinates[Index].Northing);
		}
	}
}
//******************************************************************
// Private painting functions
//******************************************************************

/**
* Simple utility to paint the meridian segments and, if they intersect with a meridian, record them
* @private
*/
CMLayerGraticule.prototype.PaintMeridianSegment=function(TheView,PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude) 
{
	TheView.PaintRefLine(PX1,PY1,PX2,PY2);
	
	CMLayerGraticule.SegmentIntersectsAHorizontal(PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefTop,this.TopIntersectionCoordinates,Longitude);
	
	CMLayerGraticule.SegmentIntersectsAHorizontal(PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefBottom,this.BottomIntersectionCoordinates,Longitude);
}

/**
* Simple utility to paint the meridian segments and, if they intersect with a meridian, record them
* @private
*/
CMLayerGraticule.prototype.PaintParallelSegment=function(TheView,PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude) 
{
	TheView.PaintRefLine(PX1,PY1,PX2,PY2);
	
	CMLayerGraticule.SegmentIntersectsAVertical(PX1,PY1,PX2,PY2,ViewRefLeft,ViewRefTop,ViewRefBottom,this.LeftIntersectionCoordinates,Latitude);
	
	CMLayerGraticule.SegmentIntersectsAVertical(PX1,PY1,PX2,PY2,ViewRefRight,ViewRefTop,ViewRefBottom,this.RightIntersectionCoordinates,Latitude);
}

//***********************************************************************
// Private functions to find the Min/Max Lat/Lon range and the spacing
// between the lines.
//***********************************************************************

/*
* Function to find the desired spacing between the lines
* @private
*/
CMLayerGraticule.prototype.GetSpacing=function(TheView,TheProjector,CenterLongitude,CenterLatitude,LongitudeRange)
{	
	if (LongitudeRange<0)
	{
		throw("Sorry, the LongitudeRange cannot be less than zero");
	}
	// Find the center of the min/max lat/lon (target area) 
//	var CenterLongitude=(MaxLon+MinLon)/2;
//	var CenterLatitude=(MaxLat+MinLat)/2;
	
	// if we don't reset the longitude to zero, the calcs below make one lon on one side of the international date line
	// and the other on the opposite side.  This leads to huge horizontal distances
//	var CenterLongitude=0; // jjg - this fixes the calc for the center longitude when it is near the international date tline

	// 	move east by 10% of the range of values to find two points in geographic (20% or 1/5 of the total area)
	var Lon1=CenterLongitude-(LongitudeRange/10);
	var Lon2=CenterLongitude+(LongitudeRange/10);
	
//	var Lat1=CenterLatitude-(LatitudeRange/10);
//	var Lat2=CenterLatitude+(LatitudeRange/10);
	
	// Project these two points.  
	var Projected1=TheProjector.ProjectFromGeographic(Lon1,CenterLatitude);
	var Projected2=TheProjector.ProjectFromGeographic(Lon2,CenterLatitude);
	
	// use the latitudes to avoid the issues with longitude crossing the date line
//	var Projected1=TheProjector.ProjectFromGeographic(CenterLatitude,Lat1);
//	var Projected2=TheProjector.ProjectFromGeographic(CenterLatitude,Lat2);
	
	var DesiredWidth=this.GetSetting("Graticule","Spacing",200);
	
	var SpacingIndex=0;
	
	if ((Projected1!=null)&&(Projected2!=null))
	{
		// Find the change in longitude (20% of the total) and the corresponding change in projected space
		var ChangeInLongitude=LongitudeRange/5;
		
		var ChangeInProjected=Projected2[0]-Projected1[0];
		if (ChangeInProjected<0) ChangeInProjected=-ChangeInProjected;
		
		// Convert the projected range to pixels
		var ChangeInPixels=TheView.GetPixelWidthFromRefWidth(ChangeInProjected);
		
		// the change in longitude over the change in pixels is the approximate degrees/pixels at the center of the area
		var DegreesPerPixel=ChangeInLongitude/ChangeInPixels;
		
		// the gradiule width in degreess is found by mulitplying DegreesPerPixels by the desired spacing of graticules in pixels
		var GraticuleWidthInDegrees=DegreesPerPixel*DesiredWidth; // deisred width
		
		// now find the spacing that is greater than the desired
		while ((CMLayerGraticule.DegreeQuantized[SpacingIndex]>GraticuleWidthInDegrees)&&
			(SpacingIndex+1<CMLayerGraticule.DegreeQuantized.length))
		{
			SpacingIndex++;
		}
		if ((SpacingIndex+1<CMLayerGraticule.DegreeQuantized.length)&&(SpacingIndex<0)) 
		{
			SpacingIndex--;
		}
	}
	var Spacing=CMLayerGraticule.DegreeQuantized[SpacingIndex];

	return(Spacing);
}
/**
* Find the coordinates at the intersection of the view bounds and the clipping bounds.
* - Finds where the clipping bounds intersects with the view edges
* - Adds any corners of the view bounds that are in the clipping bounds.
*
* @private
*/
CMLayerGraticule.prototype.GetVisibleBounds=function(TheView,TheProjector) 
{
	//**********************************************************************
	// setup the coordinates of the view edges
	var TheCanvasElement=TheView.GetCanvasElement();
	
	var ViewRefLeft=TheView.GetRefXFromPixelX(0);
	var ViewRefRight=TheView.GetRefXFromPixelX(TheCanvasElement.width);
	var ViewRefTop=TheView.GetRefYFromPixelY(0);
	var ViewRefBottom=TheView.GetRefYFromPixelY(TheCanvasElement.height);

	//**********************************************************************
	// Fill the ValidCoordinates with coordinates that are: intersection of the projected bounds and the view sides,
	//  view corners in the projected bounds, corners of the projected bounds that are inside the view
	//**********************************************************************
	var ValidCoordinates=[]; // coordinates that intersect projection bounds and view are placed here
	
	//**********************************************************************
	// find the intersecions between the bounds of the projection and each of the view edges
	// resulting points are placed in the ValidCoordinates array
	
	CMLayerGraticule.GetPolyIntersectionsWithVertical(this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,
			ViewRefLeft,ViewRefTop,ViewRefBottom,ValidCoordinates); // left side
	
	CMLayerGraticule.GetPolyIntersectionsWithVertical(this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,
			ViewRefRight,ViewRefTop,ViewRefBottom,ValidCoordinates); // right side
	
	CMLayerGraticule.GetPolyIntersectionsWithHorizontal(this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,
			ViewRefLeft,ViewRefRight,ViewRefTop,ValidCoordinates); // top
	
	CMLayerGraticule.GetPolyIntersectionsWithHorizontal(this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,
			ViewRefLeft,ViewRefRight,ViewRefBottom,ValidCoordinates); // bottom
	
	//**********************************************************************
	// get the view points that are in the bounds of the projector by checking if they are InsideAPolygon where the polygon is the projector bounds
	
	// add top left if inside
	if (CMUtilities.InsideAPolygon(ViewRefLeft,ViewRefTop,this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,this.ClippingBoxProjectedEastings.length))
	{
		ValidCoordinates.push({Easting:ViewRefLeft,Northing:ViewRefTop});
	}
	
	// add top right if inside
	if (CMUtilities.InsideAPolygon(ViewRefRight,ViewRefTop,this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,this.ClippingBoxProjectedEastings.length))
	{
		ValidCoordinates.push({Easting:ViewRefRight,Northing:ViewRefTop});
	}
	
	// add bottom right if inside
	if (CMUtilities.InsideAPolygon(ViewRefRight,ViewRefBottom,this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,this.ClippingBoxProjectedEastings.length))
	{
		ValidCoordinates.push({Easting:ViewRefRight,Northing:ViewRefBottom});
	}
	
	// add bottom left if inside
	if (CMUtilities.InsideAPolygon(ViewRefLeft,ViewRefBottom,this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,this.ClippingBoxProjectedEastings.length))
	{
		ValidCoordinates.push({Easting:ViewRefLeft,Northing:ViewRefBottom});
	}
	
	//**********************************************************************
	// paint all the valid coordinates that surround the area
	if (false) //
	{
		var NewStyle={fillStyle:"Blue"};
		TheView.SetStyle(NewStyle,false);
	
		for (var i=0;i<ValidCoordinates.length;i++)
		{
			TheView.PaintRefCircle(ValidCoordinates[i].Easting,ValidCoordinates[i].Northing,20);
		}
	}
	//**********************************************************************
	// project the valid coordinates back to geographic

	var GeoCoordinates=[];
	for (var i=0;i<ValidCoordinates.length;i++)
	{
		var Result=TheProjector.ProjectToGeographic(ValidCoordinates[i].Easting,ValidCoordinates[i].Northing);

		if (Result==null) 
		{
		//	CMMainContainer.Error("CMLayerGraticule.Paint() problem back projecting");
		}
		else
		{
			var GeoCoordinate={Longitude:Result[0],Latitude:Result[1]};
		
			GeoCoordinates.push(GeoCoordinate);
		}
	}
	return(GeoCoordinates);
}


/**
* Returns an object with the lat/lon range defined for the speciifed ClippingBounds.
*
* Approach:
* - SetupBoundsPoly() - sets up the arrays with the coordinates that go around the bounds
*  - this.ClippingBoxProjectedEastings[]
*  - this.ClippingBoxProjectedNorthings[]
*
* - And with arrays for the coordinates along the north, west, east, and southern edges of the bounds 
*  - this.ClippingBoxProjectedEastCoordinates[]
*  - this.ClippingBoxProjectedWestCoordinates[]
*  - this.ClippingBoxProjectedNorthCoordinates[]
*  - this.ClippingBoxProjectedSouthCoordinates[]
*
* - Create a ValidCoordinates array that contains:
*  - intersection of the projected bounds and the view sides,
*  - View coordinates that are inside the projectors valid bounds
*  - corners of the projected bounds that are inside the view
*
*
* @private
*/

CMLayerGraticule.prototype.GetLatLonRangeFromClippingBounds=function(TheView,ClippingPoly,TheProjector) 
{
	var Result=null;
	
//	var Spacing=-1;
//	if (LatLonRange!=null) Spacing=LatLonRange.Spacing;
	
	//**********************************************************************
	// setup globals for ClipMin/Max Lat/Lon
	//this.SetupBounds(ClippingPoly);
	
	//**********************************************************************
	// Setup the overall bounds for the allowable projection area
	// - Set up the arrays with the coordinates that go around the bounds
	//  - this.ClippingBoxProjectedEastings[]
	//  - this.ClippingBoxProjectedNorthings[]
	//
	// - And with arrays for the coordinates along the north, west, east, and southern edges of the bounds 
	//  - this.ClippingBoxProjectedEastCoordinates[]
	//  - this.ClippingBoxProjectedWestCoordinates[]
	//  - this.ClippingBoxProjectedNorthCoordinates[]
	//  - this.ClippingBoxProjectedSouthCoordinates[]
	//
	this.SetupBoundsPoly(ClippingPoly);
	
	var ClippingXMinMax=CMUtilities.GetMinMax(ClippingPoly.Xs);
	var ClippingYMinMax=CMUtilities.GetMinMax(ClippingPoly.Ys);
	
	if (false) // debugging to paint red border around bounds projected (looks good)
	{
		var NewStyle={strokeStyle:"Red",lineWidth:3};
		TheView.SetStyle(NewStyle,false);
	
		TheView.PaintRefPoly(this.ClippingBoxProjectedEastings,this.ClippingBoxProjectedNorthings,true,false,true);
	}

	//**********************************************************************
	// Get the bounds of the projection wihtin the view
	var GeoCoordinates=this.GetVisibleBounds(TheView,TheProjector);
	
	for (var i=0;i<GeoCoordinates.length;i++)
	{
		var TheCoordinate=GeoCoordinates[i];
		
		if (TheCoordinate==undefined)
		{
			var j=12;
		}
		if (ClippingXMinMax.Max==180) // 180 could get flipped to -180
		{
			if (TheCoordinate.Longitude<-179) TheCoordinate.Longitude=180;
		}
		if (ClippingXMinMax.Min==-180) // 180 could get flipped to +180
		{
			if (TheCoordinate.Longitude>179) TheCoordinate.Longitude=-180;
		}
	}
	//**********************************************************************
	// setup the coordinates of the view edges
	var TheCanvasElement=TheView.GetCanvasElement();
	
	var ViewRefLeft=TheView.GetRefXFromPixelX(0);
	var ViewRefRight=TheView.GetRefXFromPixelX(TheCanvasElement.width);
	var ViewRefTop=TheView.GetRefYFromPixelY(0);
	var ViewRefBottom=TheView.GetRefYFromPixelY(TheCanvasElement.height);

	//**********************************************************************
	// setup flags to determine if we are using the corners of the clipping bounds
	
	var ViewXs=[ViewRefLeft,ViewRefRight,ViewRefRight,ViewRefLeft];
	var ViewYs=[ViewRefTop,ViewRefTop,ViewRefBottom,ViewRefBottom];
	
	if ((this.ClippingBoxProjectedWestCoordinates.length>0)&&
		(this.ClippingBoxProjectedEastCoordinates.length>0))
	{
		SWCoordinate=this.ClippingBoxProjectedWestCoordinates[0];
		NWCoordinate=this.ClippingBoxProjectedWestCoordinates[this.ClippingBoxProjectedWestCoordinates.length-1];
		
		SECoordinate=this.ClippingBoxProjectedEastCoordinates[0];
		NECoordinate=this.ClippingBoxProjectedEastCoordinates[this.ClippingBoxProjectedEastCoordinates.length-1];
		
		var UseBoundsNW=null;
		var UseBoundsNE=null;
		var UseBoundsSE=null;
		var UseBoundsSW=null;
		
		try
		{
			UseBoundsNW=CMUtilities.InsideAPolygon(NWCoordinate.Easting,NWCoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
			UseBoundsNE=CMUtilities.InsideAPolygon(NECoordinate.Easting,NECoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
			UseBoundsSE=CMUtilities.InsideAPolygon(SECoordinate.Easting,SECoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
			UseBoundsSW=CMUtilities.InsideAPolygon(SWCoordinate.Easting,SWCoordinate.Northing,ViewXs,ViewYs,ViewXs.length);
		}
		catch (err)
		{
			throw(err);
		}
		//**********************************************************************
		if (false) // paint the corners of the projector baounds that are in the view for debugging
		{
			var NewStyle={fillStyle:"Green"};
			TheView.SetStyle(NewStyle,false);
		
			if (UseBoundsNW)
			{
				TheView.PaintRefCircle(NWCoordinate.Easting,NWCoordinate.Northing,10);
			}
			if (UseBoundsNE)
			{
				TheView.PaintRefCircle(NECoordinate.Easting,NECoordinate.Northing,10);
			}
			if (UseBoundsSE)
			{
				TheView.PaintRefCircle(SECoordinate.Easting,SECoordinate.Northing,10);
			}
			if (UseBoundsSW)
			{
				TheView.PaintRefCircle(SWCoordinate.Easting,SWCoordinate.Northing,10);
			}
		}
		var NewStyle={fillStyle:"Black"};
		TheView.SetStyle(NewStyle);
		
		//**********************************************************************
		// find the min/max in geographic coordinates
		
		var MinLat;
		var MaxLat;
		var MinLon;
		var MaxLon;
		
		if (GeoCoordinates.length>0)
		{
			MinLat=GeoCoordinates[0].Latitude;
			MaxLat=GeoCoordinates[0].Latitude;
			MinLon=GeoCoordinates[0].Longitude;
			MaxLon=GeoCoordinates[0].Longitude;
			
			for (var i=1;i<GeoCoordinates.length;i++)
			{
				if (GeoCoordinates[i].Latitude<MinLat) MinLat=GeoCoordinates[i].Latitude;
				if (GeoCoordinates[i].Latitude>MaxLat) MaxLat=GeoCoordinates[i].Latitude;
				if (GeoCoordinates[i].Longitude<MinLon) MinLon=GeoCoordinates[i].Longitude;
				if (GeoCoordinates[i].Longitude>MaxLon) MaxLon=GeoCoordinates[i].Longitude;
			}
		}
		//**********************************************************************
		// expand the min/max lat/lon based on the extreme coordinates 
		
		if ((UseBoundsNW)|(UseBoundsNE))
		{
			if ((MaxLat==undefined)||(isNaN(MaxLat))||(ClippingYMinMax.Max>MaxLat)) MaxLat=ClippingYMinMax.Max;
		}
		if ((UseBoundsSW)|(UseBoundsSE))
		{
			if ((MinLat==undefined)||(isNaN(MinLat))||(ClippingYMinMax.Min<MinLat)) MinLat=ClippingYMinMax.Min;
		}
		
		if ((UseBoundsNW)|(UseBoundsSW))
		{
			if ((MinLon==undefined)||(isNaN(MinLon))||(ClippingXMinMax.Min<MinLon)) MinLon=ClippingXMinMax.Min;
		}
		if ((UseBoundsNE)|(UseBoundsSE))
		{
			if ((MaxLon==undefined)||(isNaN(MaxLon))||(ClippingXMinMax.Max>MaxLon)) MaxLon=ClippingXMinMax.Max;
		}
		
		if ((MinLat==undefined)||(MaxLat==undefined)||(MinLon==undefined)||(MaxLon==undefined))
		{
			//window.alert("Min/Max Lat/Lon are undefined");
		}
		else
		{
			
			Result={
				MinLon:MinLon,
				MaxLon:MaxLon,
				MinLat:MinLat,
				MaxLat:MaxLat,
			};
		}
	}
	return(Result);
}
//*****************************************************************************************
// Private function to get the grid of coordinates to draw
//*****************************************************************************************
/**
* Creates a 2d grid of projtected coordinates to paint based on the specified range of
* lat/lon values
*
* @private
*/
CMLayerGraticule.prototype.GetProjectedCoordinateGrid=function(TheView,LatLonRange,TheProjector) 
{
	var MinLon=LatLonRange.MinLon;
	var MaxLon=LatLonRange.MaxLon;
	var MinLat=LatLonRange.MinLat;
	var MaxLat=LatLonRange.MaxLat;
	var Spacing=LatLonRange.Spacing;
	
	var Coordinates=[];
	var YIndex=0;
	
	// start at the top
	var Latitude=MaxLat;
	while (Latitude>=MinLat)
	{
		Coordinates[YIndex]=[];
		var XIndex=0;
		
		var Longitude=MinLon;
		while (Longitude<=MaxLon) // draw lines of longitude (6 degrees each)
		{
			// get the easting and northing
			//if (Longitude==0) Longitude=0.000000001;
			var Result=TheProjector.ProjectFromGeographic(Longitude,Latitude);
			
			if (Result!=null)
			{
				var Coordinate1={Easting:Result[0],Northing:Result[1]};
				
				// save the lat/lon for later
				Coordinate1.Longitude=Longitude;
				Coordinate1.Latitude=Latitude;
				
				// save the coordinate in the grid
				Coordinates[YIndex][XIndex]=Coordinate1;
			}
			
			// move the longitude right by Spacing or the remainder if we are at the top
			if (XIndex==0) // just added the first line at the left side
			{
				if (Longitude!=MaxLon) // did not just draw the right line
				{
					// if there is a remainder, move to an integral line based on Spacing
					var Remainder=Longitude%Spacing;
					if (Remainder!=0)
					{
						Longitude=Math.ceil(Longitude/Spacing)*Spacing;
					}
					else // otherwise, move to the next Longitude right based on Spacing
					{
						Longitude+=Spacing;
						
						if (Longitude>MaxLon) // overshot on the first column of cells
						{
							Longitude=MaxLon; // make sure we draw them
						}
					}
				}
			}
			else // not at the first line
			{
				if (Longitude!=MaxLon) // did not just draw the right line
				{
					Longitude+=Spacing; // move right based on Spacing
					
					if (Longitude>MaxLon) // went past the bottom, move to the bottom
					{
						Longitude=MaxLon;
					}
				}
				else // special case when we just drew the right line
				{
					Longitude+=Spacing; // forces an exit
				}
			}
			XIndex++;
		}
		
		// move the latitude down by Spacing or the remainder if we are at the top
		if (YIndex==0) // at the top
		{
			// if there is a remainder, move to an integral line based on Spacing
			var Remainder=Latitude%Spacing;
			if (Remainder!=0)
			{
				Latitude=Math.floor(Latitude/Spacing)*Spacing;
			}
			else // otherwise, move to the next latitude down based on Spacing
			{
				Latitude-=Spacing;
			}
		}
		else // not at the top line
		{
			if (Latitude!=MinLat) // did not just draw the bottom line
			{
				Latitude-=Spacing; // move down based on Spacing
				
				if (Latitude<MinLat) // went past the bottom, move to the bottom
				{
					Latitude=MinLat;
				}
			}
			else // special case when we just draw the bottom line
			{
				Latitude-=Spacing; // forces an exit
			}
			
		}
		YIndex++;
	}
	return(Coordinates);
}
//***********************************************************************
// Proteced Painting functions
//***********************************************************************
/**
* Paint one set of graticules based on a clipping bounds in geographic
*
* 
* @protected
*/
CMLayerGraticule.prototype.PaintCoordinateGrid=function(TheView,LatLonRange,Coordinates,TheProjector) 
{
	var MinLon=LatLonRange.MinLon;
	var MaxLon=LatLonRange.MaxLon;
	var MinLat=LatLonRange.MinLat;
	var MaxLat=LatLonRange.MaxLat;
	var Spacing=LatLonRange.Spacing;
	
	//
	
	var TheCanvasElement=TheView.GetCanvasElement();
	
	var BorderWidth=this.GetSetting("Border","BorderWidth");
	
	var ViewRefLeft=TheView.GetRefXFromPixelX(BorderWidth);
	var ViewRefRight=TheView.GetRefXFromPixelX(TheCanvasElement.width-BorderWidth);
	var ViewRefTop=TheView.GetRefYFromPixelY(BorderWidth);
	var ViewRefBottom=TheView.GetRefYFromPixelY(TheCanvasElement.height-BorderWidth);

	//******************************************************
	// draw the graticule lines
	//******************************************************
	// this gets the main style for the gratidule lines and the text in the map
	var TheStyle=this.GetStyle(TheView);
	
	if (TheStyle!=undefined) TheView.SetStyle(TheStyle,false);
	
	// if we got any coordinates, draw the grid of lines
	if (Coordinates.length!=0)
	{
		//******************************************************
		// draw the lines of longitude (meridians)
		
		var Longitude=MinLon;
		
		var NumColumns=Coordinates[0].length;
		var NumRows=Coordinates.length;
		for (var ColumnIndex=0;ColumnIndex<NumColumns;ColumnIndex++) // draw lines of longitude (6 degrees each)
		{
			if (Coordinates.length>=2)
			{
				for (var RowIndex=0;RowIndex<NumRows-1;RowIndex++)
				{
					var Coordinate1=Coordinates[RowIndex][ColumnIndex];
					var Coordinate2=Coordinates[RowIndex+1][ColumnIndex];
					
					if ((Coordinate1!=undefined)&&(Coordinate2!=undefined))
					{
						var Lat1=Coordinate1.Latitude;
						var Lon1=Coordinate1.Longitude;
						
						var Lat2=Coordinate2.Latitude;
						var Lon2=Coordinate2.Longitude;
						
						var LatRange=Lat2-Lat1;
						var LatFactor=LatRange/10;
						
						var Lat=Lat1;
						var StartCoordinate=TheProjector.ProjectFromGeographic(Lon1,Lat);
						
						for (var i=0;i<10;i++)
						{
							Lat+=LatFactor;
							
							var EndCoordinate=TheProjector.ProjectFromGeographic(Lon1,Lat);
							
							if (EndCoordinate!=undefined)
							{
								this.PaintMeridianSegment(TheView,StartCoordinate[0],StartCoordinate[1],
									EndCoordinate[0],EndCoordinate[1],ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
								
								StartCoordinate=EndCoordinate;
							}
						}
					}
				}
			}
/*			if (Coordinates.length<=1) // do nothing
			{
			}
			else if ((Coordinates.length==2)) // straight line
			{
				TheView.PaintRefLine(Coordinates[0][ColumnIndex].Easting,Coordinates[0][ColumnIndex].Northing,
					Coordinates[1][ColumnIndex].Easting,Coordinates[1][ColumnIndex].Northing);
			}
			else // at least 3, maybe more
			{
				try 
				{
					var PreviousCoordinate=Coordinates[0][ColumnIndex];
					var Coordinate1=Coordinates[1][ColumnIndex];
					var Coordinate2=Coordinates[2][ColumnIndex];
					var NextCoordinate=null;
				}
				catch(err) {
					CMMainContainer.Error(err.message);
				}
				
				//*********************************************************************************
				// Paint the first part of the graticule as a 3-point Bezier curve
				
				if ((PreviousCoordinate!=undefined)&&(Coordinate1!=undefined)&&(Coordinate2!=undefined))
				{
					// get the Bezier points for the start of the curve
					var Points=CMUtilityBezier.GetThreePoint3D(10,
							PreviousCoordinate.Easting,PreviousCoordinate.Northing,0,
							Coordinate1.Easting,Coordinate1.Northing,0,
							Coordinate2.Easting,Coordinate2.Northing,0);
					
					// paint from the parallel to the first coordinate on the Bezier curve
					this.PaintMeridianSegment(TheView,PreviousCoordinate.Easting,PreviousCoordinate.Northing,
							Points[0][0],Points[1][0],ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					
					// paint the rest of the segements in the Bezier curve
					for (var i=0;i<Points[0].length-1;i++)
					{
						this.PaintMeridianSegment(TheView,Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					}
					
					// paint the segment from the bezier to the coordinate
					this.PaintMeridianSegment(TheView,Coordinate1.Easting,Coordinate1.Northing,
							Points[0][Points[0].length-1],Points[1][Points[0].length-1],
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
				}
				var PreviousCoordinate=Coordinate1;
				
				//*********************************************************************************
				// Paint the middle part of the graticule as a 4-point Bezier curve
				
				for (var RowIndex=1;RowIndex<NumRows-2;RowIndex++)
				{
					var NextCoordinate=Coordinates[RowIndex+2][ColumnIndex];
					
					if ((PreviousCoordinate!=undefined)&&(NextCoordinate!=undefined)&&(Coordinate1!=undefined)&&(Coordinate2!=undefined))
					{
						var Points=CMUtilityBezier.GetFourPoint2D(10,
							PreviousCoordinate.Easting,PreviousCoordinate.Northing,
							Coordinate1.Easting,Coordinate1.Northing,
							Coordinate2.Easting,Coordinate2.Northing,
							NextCoordinate.Easting,NextCoordinate.Northing);
						
						// connect to the previous curve
						this.PaintMeridianSegment(TheView,
								Coordinate1.Easting,Coordinate1.Northing,
								Points[0][0],Points[1][0],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					
						// draw the middle of the curve
						for (var i=0;i<Points[0].length-1;i++)
						{
							this.PaintMeridianSegment(TheView,
									Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
						}
						// draw the end of the curve to the current point
						this.PaintMeridianSegment(TheView,
								Points[0][Points[0].length-1],Points[1][Points[0].length-1],
								Coordinate2.Easting,Coordinate2.Northing,
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					}
					PreviousCoordinate=Coordinate1;
					Coordinate1=Coordinate2;
					Coordinate2=NextCoordinate;
				}
				//*********************************************************************************
				// Paint the last part of the graticule as a 3-point Bezier curve
				
				if ((PreviousCoordinate!=undefined)&&(Coordinate1!=undefined)&&(Coordinate2!=undefined))
				{
					// get the points on the Bezier curve
					var Points=CMUtilityBezier.GetThreePoint3D(10,
							Coordinate2.Easting,Coordinate2.Northing,0,
							Coordinate1.Easting,Coordinate1.Northing,0,
							PreviousCoordinate.Easting,PreviousCoordinate.Northing,0);
					
					// draw from the coordinate to the first point on the curve
					this.PaintMeridianSegment(TheView,
							Coordinate1.Easting,Coordinate1.Northing,
							Points[0][Points[0].length-1],Points[1][Points[0].length-1],
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					
					// draw the points on the curve
					for (var i=Points[0].length-1;i>0;i--)
					{
						this.PaintMeridianSegment(TheView,
								Points[0][i],Points[1][i],Points[0][i-1],Points[1][i-1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
					}
					// paint from the Bezier curve to the last coordinate
					this.PaintMeridianSegment(TheView,
							Points[0][0],Points[1][0],Coordinate2.Easting,Coordinate2.Northing,
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Longitude);
				}
			}
	*/		Longitude+=Spacing;
		}
		
		//******************************************************
		// draw the lines of latitude (parallels)
		
		var NumPoints=9;
		var Latitude=MaxLat;
		
		for (var RowIndex=0;RowIndex<NumRows;RowIndex++)
		{
			if (Coordinates.length>=2)
			{
				for (var ColumnIndex=0;ColumnIndex<NumColumns-1;ColumnIndex++)
				{
					var Coordinate1=Coordinates[RowIndex][ColumnIndex];
					var Coordinate2=Coordinates[RowIndex][ColumnIndex+1];
					
					if ((Coordinate1!=undefined)&&(Coordinate2!=undefined))
					{
						var Lat1=Coordinate1.Latitude;
						var Lon1=Coordinate1.Longitude;
						
						var Lat2=Coordinate2.Latitude;
						var Lon2=Coordinate2.Longitude;
						
						var LonRange=Lon2-Lon1;
						var LonFactor=LonRange/10;
						
						var Lon=Lon1;
						var StartCoordinate=TheProjector.ProjectFromGeographic(Lon1,Lat1);
						
						for (var i=0;i<10;i++)
						{
							Lon+=LonFactor;
							
							var EndCoordinate=TheProjector.ProjectFromGeographic(Lon,Lat1);
							
							this.PaintParallelSegment(TheView,StartCoordinate[0],StartCoordinate[1],EndCoordinate[0],EndCoordinate[1],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
	//						TheView.PaintRefLine(StartCoordinate[0],StartCoordinate[1],
	//							EndCoordinate[0],EndCoordinate[1]);
							
							StartCoordinate=EndCoordinate;
						}
					}
				}
			}
/*			if (Coordinates[RowIndex].length<=1) // do nothing
			{
			}
			else if (Coordinates[RowIndex].length==2) // straight line
			{
				TheView.PaintRefLine(Coordinates[RowIndex][0].Easting,Coordinates[RowIndex][0].Northing,
					Coordinates[RowIndex][1].Easting,Coordinates[RowIndex][1].Northing);
			}
			else
			{
				var PreviousCoordinate=Coordinates[RowIndex][0];
				var Coordinate1=Coordinates[RowIndex][1];
				var Coordinate2=Coordinates[RowIndex][2];
				var NextCoordinate=null;
				
				//*********************************************************************************
				// Paint the first part of the graticule as a 3-point Bezier curve
				
				if ((PreviousCoordinate!=undefined)&&(Coordinate1!=undefined)&&(Coordinate2!=undefined))
				{
					// get the Bezier points for the start of the curve
					var Points=CMUtilityBezier.GetThreePoint3D(10,
							PreviousCoordinate.Easting,PreviousCoordinate.Northing,0,
							Coordinate1.Easting,Coordinate1.Northing,0,
							Coordinate2.Easting,Coordinate2.Northing,0);
					
					// draw the line from the first line of longitude to the start of the Beizer points
					this.PaintParallelSegment(TheView,PreviousCoordinate.Easting,PreviousCoordinate.Northing,Points[0][0],Points[1][0],
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
					
					// draw the Bezier curve
					for (var i=0;i<Points[0].length-1;i++)
					{
						this.PaintParallelSegment(TheView,Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
					}
					// draw segment form the end of the Bezier points to the second meridian
					this.PaintParallelSegment(TheView,Points[0][Points[0].length-1],Points[1][Points[0].length-1],
							Coordinate1.Easting,Coordinate1.Northing,
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
				}
				//*********************************************************************************
				// Paint the middle part of the graticule as a 4-point Bezier curve
				
				for (var ColumnIndex=1;ColumnIndex<NumColumns-2;ColumnIndex++) // draw lines of longitude (6 degrees each)
				{
					var NextCoordinate=Coordinates[RowIndex][ColumnIndex+2];
					
					if ((PreviousCoordinate!=undefined)&&(NextCoordinate!=undefined)&&(Coordinate1!=undefined)&&(Coordinate2!=undefined))
					{
						// get the next Bezier curve
						var Points=CMUtilityBezier.GetFourPoint2D(10,
							PreviousCoordinate.Easting,PreviousCoordinate.Northing, // for start slope
							Coordinate1.Easting,Coordinate1.Northing, // start point
							Coordinate2.Easting,Coordinate2.Northing, // end point
							NextCoordinate.Easting,NextCoordinate.Northing); // for end slope
						
						// meridan to the first Beizer point
						this.PaintParallelSegment(TheView,
								Coordinate1.Easting,Coordinate1.Northing,Points[0][0],Points[1][0],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
					
						// draw this curve
						for (var i=0;i<Points[0].length-1;i++)
						{
							this.PaintParallelSegment(TheView,
									Points[0][i],Points[1][i],Points[0][i+1],Points[1][i+1],
									ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
						}
						
						// from the last Bezier point to the next meridian
						this.PaintParallelSegment(TheView,
								Points[0][Points[0].length-1],Points[1][Points[0].length-1],Coordinate2.Easting,Coordinate2.Northing,
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
					}
					// shift the coordinates
					PreviousCoordinate=Coordinate1;
					Coordinate1=Coordinate2;
					Coordinate2=NextCoordinate;
				}
				//*********************************************************************************
				// Paint the last part of the graticule as a 3-point Bezier curve
				
				if ((PreviousCoordinate!=undefined)&&(Coordinate1!=undefined)&&(Coordinate2!=undefined))
				{
					var Points=CMUtilityBezier.GetThreePoint3D(10,
							Coordinate2.Easting,Coordinate2.Northing,0,
							Coordinate1.Easting,Coordinate1.Northing,0,
							PreviousCoordinate.Easting,PreviousCoordinate.Northing,0);
					
					// from meridian to the first Bezier point
					this.PaintParallelSegment(TheView,
							Coordinate1.Easting,Coordinate1.Northing,Points[0][Points[0].length-1],Points[1][Points[0].length-1],
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
							
					for (var i=Points[0].length-1;i>=1;i--)
					{
						this.PaintParallelSegment(TheView,
								Points[0][i],Points[1][i],Points[0][i-1],Points[1][i-1],
								ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
					}
					this.PaintParallelSegment(TheView,
							Points[0][0],Points[1][0],Coordinate2.Easting,Coordinate2.Northing,
							ViewRefLeft,ViewRefRight,ViewRefTop,ViewRefBottom,Latitude);
				}
			}
*/			Latitude-=Spacing;
		}
	}

}
/*
* Paint the coordinate labels along the grid lines
* @private
*/
CMLayerGraticule.prototype.PaintGridLabels=function(TheView,LatLonRange,Coordinates,ClippingPoly) 
{
	var MinLon=LatLonRange.MinLon;
	var MaxLon=LatLonRange.MaxLon;
	var MinLat=LatLonRange.MinLat;
	var MaxLat=LatLonRange.MaxLat;
	
	//********************************************************************************
	// draw the lat lons that are outside the bounds but do not intersect with the border

	if (Coordinates.length!=0)
	{
		var TextStyle=this.GetSettingGroup("Text");
		TheView.SetStyle(TextStyle,false);
		
		var FontSize=this.SetupLabelFont(TheView,-1); // setup the font but not from a feature
		var NumColumns=Coordinates[0].length;
		var NumRows=Coordinates.length;
		
		var RefFontHeight=TheView.GetRefHeightFromPixelHeight(FontSize);
		var RefFontCharWidth=-RefFontHeight/2;
	
		var XMinMax=CMUtilities.GetMinMax(ClippingPoly.Xs);
		var YMinMax=CMUtilities.GetMinMax(ClippingPoly.Ys);

		// paint latitudes along the west border
		if (MinLon==XMinMax.Min)
		{
			for (var Row=0;Row<NumRows;Row++)
			{
				var TheCoordinate=Coordinates[Row][0];
				
				if (TheCoordinate!=undefined)
				{
					var PixelWidth=TheView.GetTextWidthInPixels(Text);
					
					//var RefWidth=TheView.GetRefWidthFromPixelWidth(4);
					
					try
					{
						var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,false,true);
					
						TheView.PaintRefText(Text,TheCoordinate.Easting-RefFontCharWidth,TheCoordinate.Northing+RefFontHeight/2,FontSize,"right",0);
					}
					catch(e)
					{
						throw(e);
					}
				}
			}
		}
		// paint latitudes along the east border
//		var RefWidth=TheView.GetRefWidthFromPixelWidth(4);
					
		if (MaxLon==XMinMax.Max)
		{
			for (var Row=0;Row<NumRows;Row++)
			{
				var TheCoordinate=Coordinates[Row][NumColumns-1];
				
				if (TheCoordinate!=undefined)
				{
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,false,true);
					
					TheView.PaintRefText(Text,TheCoordinate.Easting+RefFontCharWidth,TheCoordinate.Northing+RefFontHeight/2,FontSize,"",0)
				}
			}
		}
		// paint longitudes along the south border
		if (MinLat==YMinMax.Min)
		{
			for (var Column=0;Column<NumColumns;Column++)
			{
				var TheCoordinate=Coordinates[NumRows-1][Column];
				
				if (TheCoordinate!=undefined)
				{
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
			
					TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing+RefFontHeight,FontSize,"center",0)
				}
			}
		}
		// paint longitudes along the north border
		if (MaxLat==YMinMax.Max)
		{
			for (var Column=0;Column<NumColumns;Column++)
			{
				var TheCoordinate=Coordinates[0][Column];
				
				if (TheCoordinate!=undefined)
				{
					var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
					
					TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing-RefFontHeight/4,FontSize,"center",0)
				}
			}
		}
	}
}
/**
* Paint the border around the outside of the map for the coordinates when the graticules intersect with
* the edge of the map
*/
CMLayerGraticule.prototype.PaintBorder=function(TheView) 
{
	//*********************************************************
	// draw the border width coordinates in it.
	
	var BorderWidth=this.GetSetting("Border","BorderWidth",10);
	
	if (BorderWidth>0)
	{
		var TheCanvasElement=TheView.GetCanvasElement();
		
		var CanvasWidth=TheCanvasElement.width;
		var CanvasHeight=TheCanvasElement.height;
		
		// the border is filled only
		var FillStyle=this.GetSetting("Border","fillStyle","rgba(255,255,255)");
		var NewStyle={fillStyle:FillStyle,strokeStyle:"rgba(0,0,0,0)"};
		TheView.SetStyle(NewStyle,false);
		
		TheView.PaintRect(0,BorderWidth,0,CanvasHeight); // left
		TheView.PaintRect(0,CanvasWidth,0,BorderWidth); // top
		TheView.PaintRect(CanvasWidth-BorderWidth,CanvasWidth,0,CanvasHeight); // right
		TheView.PaintRect(0,CanvasWidth,CanvasHeight-BorderWidth,CanvasHeight); // bottom
		
		// the neat line is just stroked
		var NeatLineStyle=this.GetSetting("Border","strokeStyle","rgba(0,0,0)");
		var NewStyle={fillStyle:"rgba(0,0,0,0)",strokeStyle:NeatLineStyle};
		TheView.SetStyle(NewStyle,false);
		
		TheView.PaintRect(BorderWidth,CanvasWidth-BorderWidth,BorderWidth,CanvasHeight-BorderWidth); // bottom
	}
}
/**
* Paint the coordinate labels around the edge of the map
*/
CMLayerGraticule.prototype.PaintBorderLabels=function(TheView) 
{
	var BorderWidth=this.GetSetting("Border","BorderWidth",10);
	
	if (BorderWidth>0)
	{
		// draw the coordinates in the border
		
		var BorderTextStyle=this.GetSettingGroup("BorderText");
		var FontSize=this.SetupLabelFont(TheView,-1); // setup the font but not from a feature
		
		TheView.SetStyle(BorderTextStyle,false);
		
		// draw coordinates in the top border
		
		TheView.ResetCollisions();
				
		var RefFontSize=TheView.GetRefHeightFromPixelHeight(FontSize);
		
		var RefOffsetToBorder=RefFontSize*0.2; // find the offset to the bottom of the border from be text baseline
		
		if (this.TopIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.TopIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.TopIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
				
				TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing-RefOffsetToBorder,FontSize,"center",0)
			}
		}
		// draw coordinates in the bottom border
		
		var RefOffset2=TheView.GetRefHeightFromPixelHeight(FontSize);
				
		if (this.BottomIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.BottomIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.BottomIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Longitude,true,true);
				
				TheView.PaintRefText(Text,TheCoordinate.Easting,TheCoordinate.Northing+(RefOffset2*0.9),FontSize,"center",0)
			}
		}
		// draw coordinates in the left border
				
		if (this.LeftIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.LeftIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.LeftIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,false,true);
				
				TheView.PaintRefText(Text,TheCoordinate.Easting+RefOffsetToBorder,TheCoordinate.Northing,FontSize,"center",-Math.PI/2)
			}
		}
		
		// draw coordinates in the right border
		
		if (this.RightIntersectionCoordinates!=null)
		{
			for (var i=0;i<this.RightIntersectionCoordinates.length;i++)
			{
				var TheCoordinate=this.RightIntersectionCoordinates[i];
				
				var Text=CMUtilities.GetDMSFromDD(TheCoordinate.Latitude,false,true);
				
				TheView.PaintRefText(Text,TheCoordinate.Easting-RefOffsetToBorder,TheCoordinate.Northing,FontSize,"center",Math.PI/2)
			}
		}
	}
}
//**************************************************************************
// CMBase Functions
//**************************************************************************

CMLayerGraticule.prototype.CMLayer_SettingsChanged=CMLayer.prototype.SettingsChanged;

CMLayerGraticule.prototype.SettingsChanged=function()
{
	this.CMLayer_SettingsChanged();
	
	this.ClippingBoxProjectedEastings=null;
}
// we want the CMItem definitions but not the CMLayer definitions
CMLayerGraticule.prototype.CMLayer_GetSettingsDefinitions=CMLayer.prototype.GetSettingsDefinitions;

CMLayerGraticule.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMLayer_GetSettingsDefinitions();
	
	for (Key in CMLayerGraticule.SettingDefintions)
	{
		Result[Key]=CMLayerGraticule.SettingDefintions[Key];
	}

	return(Result); 
}

//******************************************************************
// CMLayer Functions
//******************************************************************
/**
* Paint one set of graticules based on a clipping bounds in geographic
*
* Approach:
* - GetLatLonRangeFromClippingBounds
* - GetProjectedCoordinateGrid
*
* @protected
*/
CMLayerGraticule.prototype.Paint=function(TheView) 
{
	// 2D painting
	if ((this.IsVisible(TheView))&&(TheView instanceof CMView2D))
	{
		// make sure we have a projector
		var TheGeo=this.GetParent(CMGeo);
		
		var TheProjector=TheGeo.GetProjector();
		if (TheProjector==null) TheProjector=new CMProjector(); // geographic
		
		TheProjector.Projection=null;
		TheProjector.Initialize();
		
		//*******************************************************
		// Find the lat/long min/maxes that for each clipping bounds that appears in the view
		var ClippingPolys=TheProjector.GetClippingPolys();
		
		if (ClippingPolys!=undefined)
		{
			var LatLonRanges=[];
			for (var i=0;i<ClippingPolys.length;i++)
			{
				var ClippingPoly=ClippingPolys[i]; // Xmin,Ymin,XMax,YMax
				
				var LatLonRange=this.GetLatLonRangeFromClippingBounds(TheView,ClippingPoly,TheProjector);
				
				LatLonRanges.push(LatLonRange);
			}
			//**********************************************************************************************
			// Find the center of the largest clipping bounds in the view and the total range of lat/lon values
			//var TotalLatitudeRange=-1;
			var TotalLonRange;
			var MaxLonRange=0; // maximum width of the map in the current projection
			var LonAtMaxLonRange=0; // lat and lon at the maximum width
			var LatAtMaxLonRange=0;
			
			for (var i=0;i<ClippingPolys.length;i++)
			{
				var LatLonRange=LatLonRanges[i];
				
				if (LatLonRange!=null)
				{
					var NewLatRange=LatLonRange.MaxLat-LatLonRange.MinLat;
					var NewLonRange=LatLonRange.MaxLon-LatLonRange.MinLon;
					
					if (NewLonRange>MaxLonRange) // works for -1 to initialize or when smaller
					{
						MaxLonRange=NewLonRange;
						LonAtMaxLonRange=(LatLonRange.MaxLon+LatLonRange.MinLon)/2;
						LatAtMaxLonRange=(LatLonRange.MaxLat+LatLonRange.MinLat)/2;
					}
					//TotalLatitudeRange+=NewLatRange;
					if (TotalLonRange==undefined) TotalLonRange=NewLonRange;
					else TotalLonRange+=NewLonRange;
				}
			}
			
			//**********************************************************************
			// Find the spacing between the lines based on the resolution of the map (returns a value from the DegreeQuantized[] array
			//if (Spacing==-1)
	
			if (TotalLonRange<0) 
			{
				throw("Sorry, the TotalLonRange cannot be less than zero");
			}
			else
			{
				Spacing=this.GetSpacing(TheView,TheProjector,LonAtMaxLonRange,LatAtMaxLonRange,TotalLonRange);
			
				//console.log("Spacing="+Spacing);
				
				var TheStyle=this.GetStyle();
			
				for (var i=0;i<ClippingPolys.length;i++)
				{
					var LatLonRange=LatLonRanges[i];
					
					if (LatLonRange!=null)
					{
						var ClippingPoly=ClippingPolys[i];
						
						var XMinMax=CMUtilities.GetMinMax(ClippingPoly.Xs);
						var YMinMax=CMUtilities.GetMinMax(ClippingPoly.Ys);
						
						LatLonRange.Spacing=Spacing;
						
						//**********************************************************************
						// find the lat/lons that are an even mulitple of the spacing
						// In other words, move the grid out until we hit meridians and parallels that fit the spacing.
						
						LatLonRange.MinLon=Math.floor(LatLonRange.MinLon/Spacing-1)*Spacing;
						LatLonRange.MaxLon=Math.ceil(LatLonRange.MaxLon/Spacing+1)*Spacing;
						LatLonRange.MinLat=Math.floor(LatLonRange.MinLat/Spacing-1)*Spacing;
						LatLonRange.MaxLat=Math.ceil(LatLonRange.MaxLat/Spacing+1)*Spacing;
						
						if (LatLonRange.MinLon<XMinMax.Min) LatLonRange.MinLon=XMinMax.Min;
						if (LatLonRange.MaxLon>XMinMax.Max) LatLonRange.MaxLon=XMinMax.Max;
						if (LatLonRange.MinLat<YMinMax.Min) LatLonRange.MinLat=YMinMax.Min;
						if (LatLonRange.MaxLat>YMinMax.Max) LatLonRange.MaxLat=YMinMax.Max;
					}
				}
				//*********************************************************************
				// Paint the graticules which includes where they intersect with the view bounds
				
				this.BottomIntersectionCoordinates=[];
				this.TopIntersectionCoordinates=[];
				this.LeftIntersectionCoordinates=[];
				this.RightIntersectionCoordinates=[];
				
				var TextVisible=this.GetSetting("Text","Visible",true);
	
				for (var i=0;i<ClippingPolys.length;i++)
				{
					var LatLonRange=LatLonRanges[i];
					
					if (LatLonRange!=null)
					{
						var ClippingPoly=ClippingPolys[i];
						
						if (LatLonRange!=null) // returns null if the grid is not in the view
						{
							var ProjectedCoordinateGrid=this.GetProjectedCoordinateGrid(TheView,LatLonRange,TheProjector);
							
							// setup an array to catch any points of intersection that cross the border
							this.PaintCoordinateGrid(TheView,LatLonRange,ProjectedCoordinateGrid,TheProjector);
							
							if (TextVisible)
							{
								TheView.ResetCollisions();
					
								// paint the labels within the grid
								
								this.PaintGridLabels(TheView,LatLonRange,ProjectedCoordinateGrid,ClippingPoly);
							}
						}
					}
				}
				//***********************************************************************************
				// After the graticules have been painted, we can paint the border and border labels if desired
				
				// paint the boreder with it's labels
				this.PaintBorder(TheView);
		
				// paint the boreder with it's labels
				this.PaintBorderLabels(TheView);
			}
		}
		// restore the original style
		TheStyle=TheView.SetStyle(TheStyle);
	}
}


//CanvasMap/js/CMLayerItems.js
/******************************************************************************************************************
* CMLayerItems
*
* @module CMLayerItems
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// CMToolHandler (move later?)
//******************************************************************

function CMToolHandler(ObjectType)
{
	this.ObjectType=ObjectType;
} 
CMToolHandler.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
//	if (this.TheLayer.Dragging==false) // not creating something already
	{
		var ItemIndex=-1;
		
		var NewObject=null;
		
		switch (this.ObjectType)
		{
		case "Rectangle":
			NewObject=new CMItemRect(CMItemRect.RECTANGLE);
			ItemIndex=this.TheLayer.AddChild(NewObject);
			NewObject.SetControlBounds(RefX,RefX,RefY,RefY);
			break;
		case "RoundedRectangle":
			NewObject=new CMItemRect(CMItemRect.ROUNDED_RECTANGLE);
			ItemIndex=this.TheLayer.AddChild(NewObject);
			NewObject.SetControlBounds(RefX,RefX,RefY,RefY);
			break;
		case "Oval":
			NewObject=new CMItemRect(CMItemRect.OVAL);
			ItemIndex=this.TheLayer.AddChild(NewObject);
			NewObject.SetControlBounds(RefX,RefX,RefY,RefY);
			break;
		case "Polygon":
			NewObject=new CMItemPoly();
			ItemIndex=this.TheLayer.AddChild(NewObject);
			
			var Xs=[RefX,RefX];
			var Ys=[RefY,RefY];
			var Smoothing=[false,false];
			NewObject.SetControlPoints(0,Xs,Ys,Smoothing);
//			NewObject.SetSettings("Curve","Smoothing",false);
			break;
		case "Curve":
			NewObject=new CMItemPoly();
			ItemIndex=this.TheLayer.AddChild(NewObject);
			
			var Xs=[RefX,RefX];
			var Ys=[RefY,RefY];
			var Smoothing=[true,true];
			NewObject.SetControlPoints(0,Xs,Ys,Smoothing);
			break;
		case "Arrow":
			NewObject=new CMItemPolyArrow();
			ItemIndex=this.TheLayer.AddChild(NewObject);
			
			var Xs=[RefX,RefX];
			var Ys=[RefY,RefY];
			var Smoothing=[true,true];
			NewObject.SetControlPoints(0,Xs,Ys,Smoothing);
			break;
		}
	
		NewObject.StartCreating(RefX,RefY);
		NewObject.SetSelected(true);
		NewObject.SetSetting("Item","Status",CMItem.STATUS_EDITABLE);
		
		this.TheLayer.SelectedItemIndex=ItemIndex;
		
		Used=true;
	}
	
	return(Used);
}
CMToolHandler.prototype.MouseMove=function(TheView,RefX,RefY) 
{
	return(false);
}
CMToolHandler.prototype.MouseUp=function(TheView,RefX,RefY) 
{
	return(false);
}

//******************************************************************
// CMLayerItems Constructor
//******************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMLayerItems() 
{
	CMLayer.call(this);

	// Properties
	this.SelectedItemIndex=-1; // jjg remove?
	
	this.ToolGroupElement=null;
	
	this.SetSetting("Item","Status",CMItem.STATUS_EDITABLE);
	
	this.SetSetting("Item","Name","Item Layer");
}

CMLayerItems.prototype=Object.create(CMLayer.prototype); // inherit prototype functions

CMLayerItems.prototype.contructor=CMLayerItems; // override the constructor to go to ours

//******************************************************************
// CMLayerItems private functions
//******************************************************************
/**
* @private
*/
CMLayerItems.prototype.Unselected=function() 
{
	if (this.ToolGroupElement!=null)
	{
		var TheCanvasMap=this.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		TheToolPanel.RemoveTool("CMLayerObjects_RectImage");
		TheToolPanel.RemoveTool("CMLayerObjects_RoundedRectImage");
		TheToolPanel.RemoveTool("CMLayerObjects_OvalImage");
		TheToolPanel.RemoveTool("CMLayerObjects_CurveImage");
		TheToolPanel.RemoveTool("CMLayerObjects_ArrowImage");
		
		TheToolPanel.RemoveToolGroupElement(this.ToolGroupElement);
		this.ToolGroupElement=null;
		
		var TheView=TheCanvasMap.GetView();
		
		TheView.SetToolHandler(null);
	}
}

//******************************************************************
// CMBase Functions
//******************************************************************
// override the layer UnselectAll() function
CMLayerItems.prototype.CMLayer_UnselectAll=CMLayer.prototype.UnselectAll;

CMLayerItems.prototype.UnselectAll=function(SendMessage) 
{
	this.CMLayer_UnselectAll(SendMessage);
	
	var NumChildren=this.GetNumChildren();
	
	for (var i=0;i<NumChildren;i++)
	{
		var TheChild=this.GetChild(i);
		
		TheChild.UnselectAll(SendMessage);
	}
	this.Unselected();
}
/**
* Called when the layer is selected
*/
CMLayerItems.prototype.CMLayer_SetSelected=CMLayer.prototype.SetSelected;

CMLayerItems.prototype.SetSelected=function(New) 
{
	if (New!=this.GetSelected()) // selection has changed
	{
		this.CMLayer_SetSelected(New);

		var TheCanvasMap=this.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		if (New)
		{
			if (TheToolPanel!=null)
			{
				// add the rect tool
				
				var ImageFolder=TheCanvasMap.GetSetting("MainContainer","ImageFolder");
				
				var RectTool=TheToolPanel.AddTool("CMLayerObjects_RectImage",ImageFolder+"Icon_Rect_Default.png",
					ImageFolder+"Icon_Rect_Selected.png");
				
				CMLayerItems.SetupTool(RectTool,this,"Rectangle");
				
				// add the rRoundRectTool
				
				var RoundRectTool=TheToolPanel.AddTool("CMLayerObjects_RoundedRectImage",ImageFolder+"Icon_RoundedRect_Default.png",
					ImageFolder+"Icon_RoundedRect_Selected.png");
				
				CMLayerItems.SetupTool(RoundRectTool,this,"RoundedRectangle");
				
				// add the oval
				
				var OvalTool=TheToolPanel.AddTool("CMLayerObjects_OvalImage",ImageFolder+"Icon_Oval_Default.png",
					ImageFolder+"Icon_Oval_Selected.png");
				
				CMLayerItems.SetupTool(OvalTool,this,"Oval");
				
				// add the polygon tool
				
				var PolygonTool=TheToolPanel.AddTool("CMLayerObjects_PolygonImage",ImageFolder+"Icon_Polygon_Default.png",
					ImageFolder+"Icon_Polygon_Selected.png");
				
				CMLayerItems.SetupTool(PolygonTool,this,"Polygon");
				
				// add the curve tool
				
				var CurveTool=TheToolPanel.AddTool("CMLayerObjects_CurveImage",ImageFolder+"Icon_Curve_Default.png",
					ImageFolder+"Icon_Curve_Selected.png");
				
				CMLayerItems.SetupTool(CurveTool,this,"Curve");
				
				// add the arrow tool
				
				var ArrowTool=TheToolPanel.AddTool("CMLayerObjects_ArrowImage",ImageFolder+"Icon_Arrow_Default.png",
					ImageFolder+"Icon_Arrow_Selected.png");
				
				CMLayerItems.SetupTool(ArrowTool,this,"Arrow");
				
				// make the tools into a group
				this.ToolGroupElement=TheToolPanel.MakeToolGroup([RectTool,RoundRectTool,OvalTool,CurveTool,ArrowTool,PolygonTool]);
			}
			//else
			{
				//TheToolPanel.AddToolGroupElement(this.ToolGroupElement);
			}
		}
		else // delete the tool from the tool bar
		{
			this.Unselected();
		}
		
	}
}
/**
* Sets up a tool to be displayed in the menu bar.
* This is a helper function.
* @ TheTool - Tool element
* @private
*/
CMLayerItems.SetupTool=function(TheTool,TheLayer,ObjectType)
{
	TheTool.TheLayer=TheLayer;
	TheTool.ObjectType=ObjectType;
	
	TheTool.Original_onclick=TheTool.onclick;
	
	TheTool.onclick=function() 
	{ 
		TheTool.Original_onclick();
		
		var TheCanvasMap=this.TheLayer.GetParent(CMMainContainer);
		var TheToolPanel=TheCanvasMap.GetToolPanel();
		
		// setup the tool handler in the view
		
		var TheView=TheCanvasMap.GetView();
		var TheToolHandler=new CMToolHandler(this.ObjectType);
		TheToolHandler.TheLayer=this.TheLayer;
		
		TheView.SetToolHandler(TheToolHandler);
	}
	TheTool.UnselectFunction=function()
	{
		var TheCanvasMap=this.TheLayer.GetParent(CMMainContainer);
		var TheView=TheCanvasMap.GetView();
		
		// reset the tool handler
		TheView.SetToolHandler(null);
	}

}
CMLayerItems.prototype.CMLayer_GetTimeSlices=CMLayer.prototype.GetTimes;

CMLayerItems.prototype.GetTimes=function(TheTimeSlices) 
{
	TheTimeSlices=this.CMLayer_GetTimeSlices(TheTimeSlices);
	
	var NumChildren=this.GetNumChildren();
	
	for (var i=0;i<NumChildren;i++)
	{
		var TheChild=this.GetChild(i);
		
		TheTimeSlices=TheChild.GetTimes(TheTimeSlices);
	}
	return(TheTimeSlices);
}
//******************************************************************
// CMLayer Mouse event handling
//******************************************************************

/*
* returns the feature index for the coordinate in projected space
* returns -1 if the coordinate is not in a feature
*/
CMLayerItems.prototype.In=function(TheView,RefX,RefY) 
{
	var ItemIndex=-1;
	
	var NumChildren=this.GetNumChildren();
	
	if ((this.IsVisible(TheView))&&(NumChildren>0))
	{
		var RefTolerance=this.GetRefTolerance(TheView);
			
		// Loop over the features
		for (var i=0;( i <NumChildren)&&(ItemIndex==-1); i++) 
		{
			var TheChild=this.GetChild(i);
			
			var Part=TheChild.InPart(TheView,RefX,RefY,RefTolerance);
			
			if (Part!=-1) ItemIndex=i;
		}
	}
	return(ItemIndex);
};

CMLayerItems.prototype.MouseDown=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if ((this.IsVisible(TheView))&&(this.GetSetting("Item","Status")>=CMItem.STATUS_SELECTABLE)) // check if we where clicked in
	{
/*		if ((Used==false)&&(this.Creating))
		{
			var TheItem=this.TheItems[this.SelectedItemIndex];
			
			var NumPoints=TheItem.Xs.length;
			
			if (TheEvent.detail==2) // double click
			{
				this.Creating=false;
				this.Dragging=false;
				TheItem.Xs.pop(); // remove the last point which was added by the second button click
				TheItem.Ys.pop(); // remove the last point which was added by the second button click
			}
			else // add a point
			{
				TheItem.Xs.splice(NumPoints-1,0,RefX);
				TheItem.Ys.splice(NumPoints-1,0,RefY);
			}
			Used=true;
			this.Repaint();
		}
*/		if ((Used==false)&&((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT)))
		{
			var ItemIndex=this.In(TheView,RefX,RefY);
			
			if (ItemIndex!=-1)
			{
				var TheChild=this.GetChild(ItemIndex);
				
				Used=TheChild.MouseDown(TheView,RefX,RefY,TheEvent);
				
				if (this.GetChild(ItemIndex).GetSelected())
				{
					this.SelectedItemIndex=ItemIndex;
					Used=true;
				}
/*				this.Dragging=true;
				this.SelectedPart=this.InPart(TheView,RefX,RefY,ItemIndex);
				this.SetAnchor(RefX,RefY,ItemIndex,this.SelectedPart) ;
				this.SelectedItemIndex=ItemIndex;
*/				
			}
		}
	}
	return(Used);
};
CMLayerItems.prototype.MouseMove=function(TheView,RefX,RefY,TheEvent) 
{
	var Used=false;
	
	if (this.GetSetting("Item","Status")>=CMItem.STATUS_SELECTABLE)
	{
		var NumChildren=this.GetNumChildren();
		
		for (var i=0;(i<NumChildren)&&(Used==false); i++) 
		{
			var TheChild=this.GetChild(i);
			
			if (TheChild.GetSelected())
			{
				Used=TheChild.MouseMove(TheView,RefX,RefY,TheEvent);
			}
		}
	}
	return(Used);
};
CMLayerItems.prototype.MouseUp=function(TheView,RefX,RefY,TheEvent)
{
	var Used=false;
	
	if (this.GetSetting("Item","Status")>=CMItem.STATUS_SELECTABLE)
	{
		var NumChildren=this.GetNumChildren();
		
		for (var i=0;( i <NumChildren)&&(Used==false); i++) 
		{
			var TheChild=this.GetChild(i);
			
			if (TheChild.GetSelected())
			{
				Used=TheChild.MouseUp(TheView,RefX,RefY,TheEvent);
			}
		}
	}
	return(Used);
};

CMLayerItems.prototype.ShowInfoWindow=function(FeatureIndex,TheView,RefX,RefY) 
{
	var TheFeatures=this.TheData.features;

	var TheFeature=TheFeatures[FeatureIndex];
	
	var Properties=TheFeature.properties;
	
	var TheHTML=this.GetFeatureSetting("Layer","InfoText",FeatureIndex,null);
	
	if (TheHTML!=null)
	{
		var InfoWindow=TheView.CreateInfoWindow("CMLayerItems.InfoWindow",RefX,RefY,this.GetInfoWindowWidth(),30,TheHTML);
		
		CMMainContainer.SetPopupWindow(InfoWindow);
	}
};

//******************************************************************
// CMLayerItems Painting Functions
//******************************************************************
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerItems.prototype.Paint=function(TheView) 
{
	var NumChildren=this.GetNumChildren();
	
	if ((this.IsVisible(TheView))&&(NumChildren>0))
	{
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
			
		for (var i=0;i<NumChildren;i++)
		{
			var TheChild=this.GetChild(i);
			
			TheChild.Paint(TheView);
		}
		if (TheStyle!=undefined) TheView.RestoreStyle();
	}
}
/*
* Paints a layer into the canvas
* This is a little complicated because the geometries can contain
* polylines, polygons or points. 
*/
CMLayerItems.prototype.PaintSelected=function(TheView) 
{
	if (this.IsVisible(TheView))
	{
		// paint the mouse over if any
		
		TheView.SaveStyle();
		
		var NumChildren=this.GetNumChildren();
		
		for (var i=0;(i<NumChildren); i++) 
		{
			var TheChild=this.GetChild(i);
			
			TheChild.PaintSelected(TheView);
		}

		TheView.RestoreStyle(); 
	}
}

//******************************************************************
// Public CMLayerItems functions
//******************************************************************

CMLayerItems.prototype.CMLayer_AddChild=CMLayer.prototype.AddChild;

CMLayerItems.prototype.AddChild=function(TheObject) 
{
	var Index=this.CMLayer_AddChild(TheObject);
	
//	this.TheItems.push(TheObject);
//	TheObject.SetParent(this);
	this.Repaint();
	
	this.GetParent(CMScene).LayerContentChanged(this);
	
	return(Index);
}

CMLayerItems.prototype.GetSelectedItemIndex=function() 
{
	return(this.SelectedItemIndex);
}
//CanvasMap/js/CMLayerRaster.js
/***************************************************************************************
* CMLayerRaster Class
*
* Displays a standard web raster (jpg or png) on the map based on a specified bounds
*
* @module CMLayerRaster
* @Copyright HSU, Jim Graham, 2019
***************************************************************************************/
//******************************************************************
// CMLayerRaster Class
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMLayerRaster.SettingDefintions=
{
	Raster: 
	{ 
		Bounds: { Name:"Bounds",Type:CMBase.DATA_TYPE_BOUNDS, Default:null}, // Bounds object for the raster with XMin,XMax,YMin,YMax values
	},
	Dataset: 
	{ 
		URL: { Name:"URL",Type:CMBase.DATA_TYPE_STRING, Default:null }, // Full or partial URL to the dataset to load into the layer
	}
};

//******************************************************************
// Constructor
//******************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMLayerRaster() 
{
	CMLayer.call(this);

	// Properties
	this.TheImage=null;
	
	this.SetSetting("Item","Name","Raster Layer");
}
CMLayerRaster.prototype=Object.create(CMLayer.prototype); // inherit prototype functions from PanelBase()

CMLayerRaster.prototype.contructor=CMLayerRaster; // override the constructor to go to ours

//**************************************************************
// CMBase Functions
//**************************************************************

CMLayerRaster.prototype.CMLayer_GetSettingsDefinitions=CMLayer.prototype.GetSettingsDefinitions;

CMLayerRaster.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMLayer_GetSettingsDefinitions();
	
	for (Key in CMLayerRaster.SettingDefintions)
	{
		Result[Key]=CMLayerRaster.SettingDefintions[Key];
	}
	return(Result); 
}

//******************************************************************
// CMLayer Class
//******************************************************************
/*
* Deprecated, use RequestData();
* @protected
*/
CMLayerRaster.prototype.SetURL=function(URL) 
{
	this.TheImage=new Image(); 
	this.TheImage.Loaded=false;
	this.TheImage.TheLayer=this;
	
	this.TheImage.onload=function () 
	{ 
		this.Loaded=true;
		this.TheLayer.OnLoad();
	};

	this.TheImage.src=URL;
}
//******************************************************************
// CMLayerRaster Functions
//******************************************************************
/**
* SetBounds must be called before SetImage or SetURL are called so the raster can be 
*/

CMLayerRaster.prototype.SetImage=function(TheImage) 
{
	this.TheImage=TheImage;
}

CMLayerRaster.prototype.In=function(TheView,RefX,RefY) 
{
	return(-1);
};

/*
* Paints a layer into the canvas
*/
CMLayerRaster.prototype.Paint=function(TheView) 
{
	if ((this.IsVisible(TheView))&&(this.TheImage!=null)&&(this.TheImage.Loaded==true))
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		var TheBounds=this.TheBounds;
		
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
		
		if (TheBounds!=null)
		{
			TheView.PaintRefImageScaled(this.TheImage,this.TheBounds);
		}
		else // draw the raster in the upper left corner of the canvas
		{
			TheContext.drawImage(this.TheImage,0,0,this.TheImage.width,this.TheImage.height);
		}
		if (TheStyle!=undefined) TheView.RestoreStyle();
	}
}


//CanvasMap/js/CMLayerGrid.js
/******************************************************************************************************************
* CMLayerGrid Class
*
* Displays a raster based on the numeric values in a JSON file.
*
* @module CMDatasetPyramidOpenFormat
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************
function CMLayerGrid() 
{
	CMLayer.call(this);

	// Properties
	this.TheImage=null;
	
	this.SetSetting("Item","Name","Raster Grid Layer");
}	

CMLayerGrid.prototype=Object.create(CMLayer.prototype); // inherit prototype functions from PanelBase()

CMLayerGrid.prototype.contructor=CMLayerGrid; // override the constructor to go to ours
//******************************************************************
// CMLayer Class
//******************************************************************
/*
* Called to obtain the data for the layer from a URL.
* Depricated, use:
*	- SetSetting("Dataset","URL",URL);
*	- SetSetting("Dataset","Format",Format);
*	- RequestData()
*
* TheView is required so the layer can be repainted when data is received. 
* @override, @public
* @param URL - the URL to use to obtain data
* @param DataSetType - optional data set type (GeoJSON is the default)
*/
CMLayerGrid.prototype.RequestData=function() 
{
	var URL=this.GetSetting("Dataset","URL",null);
	var Format=this.GetSetting("Dataset","Format",CMDataset.GEOJSON);
	this.SetURL(URL,Format);
}
/*
* Depricated from public servers
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
* @private
*/
CMLayerGrid.prototype.SetURL=function(URL) 
{
	var TheRequest=new XMLHttpRequest();
	TheRequest.open("GET",URL,true);
	TheRequest.TheURL=URL;
	TheRequest.TheLayer=this;
	
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
			if( this.status == 200) // OK
			{
				// get the JSON object from the response
				
				var TheText=TheRequest.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
				
				// find the parameters for the data
				
				this.TheLayer.NumBands=TheGeoJSONObject.NumBands;
				
				this.TheLayer.NumColumns=TheGeoJSONObject.WidthInPixels;
				this.TheLayer.NumRows=TheGeoJSONObject.HeightInPixels;
				
				this.TheLayer.MinPixelValues=TheGeoJSONObject.MinPixelValues;
				this.TheLayer.MaxPixelValues=TheGeoJSONObject.MaxPixelValues;
			
				this.TheLayer.TheData=TheGeoJSONObject.Data;
				
				// get the bounds 
				
				this.TheLayer.TheBounds=TheGeoJSONObject.Bounds; // 
				
				this.TheLayer.OnLoad();
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
}

//******************************************************************
// CMLayerGrid Functions
//******************************************************************

CMLayerGrid.prototype.In=function(TheView,RefX,RefY) 
{
	return(-1);
};

/*
* Paints a layer into the canvas
*/
CMLayerGrid.prototype.Paint=function(TheView) 
{
	if ((this.TheData!=undefined)&&(this.TheImageData==null))
	{
		var Range=this.MaxPixelValues-this.MinPixelValues;
		var Factor=255.0/Range;
		
		var TheCanvasElement=TheView.GetCanvasElement();
		
		var TheContext=TheCanvasElement.getContext("2d");
		var TheImageData=TheContext.createImageData(this.NumColumns,this.NumRows);
		
		var Index=0;
		for (var y=0;y<this.NumRows;y++)
		{
			for (var x=0;x<this.NumColumns;x++)
			{
				var Value=this.TheData[y][x];
				
				Value=(Value-this.MinPixelValues)*Factor; // convert to 0 to 255
				
				TheImageData.data[Index+0]=Value;
				TheImageData.data[Index+1]=Value;
				TheImageData.data[Index+2]=Value;
				TheImageData.data[Index+3]=255;
				
				Index+=4;
			}
		}
		this.TheImageData=TheImageData;
	}
	
	if ((this.IsVisible(TheView))&&(this.TheImageData!=null))
	{
		// Get the drawing context from our <canvas> and
		// set the fill to determine what color our map will be.
		var TheContext=TheView.GetContext();
		
		var TheBounds=this.TheBounds;
		
		var TheStyle=this.GetStyle(TheView);
		
		if (TheStyle!=undefined) TheView.SetStyle(TheStyle);
		
		//TheContext.putImageData(this.TheImageData,100,100);	
		
		if (TheBounds!=null)
		{
			RefX=TheBounds.XMin;
			RefY=TheBounds.YMax;
			RefWidth=TheBounds.XMax-TheBounds.XMin;
			RefHeight=TheBounds.YMin-TheBounds.YMax;
		
			var Result=TheView.GetPixelFromRef(RefX,RefY);
			var XInPixels1=Math.round(Result.PixelX);
			var YInPixels1=Math.round(Result.PixelY);
			
			var PixelWidth=TheView.GetPixelWidthFromRefWidth(RefWidth);
			var PixelHeight=TheView.GetPixelHeightFromRefHeight(RefHeight);
			
			PixelWidth=Math.round(PixelWidth);
			PixelHeight=Math.round(PixelHeight);
			
			var TheCanvasElement=TheView.GetCanvasElement();
			var TheContext=TheCanvasElement.getContext("2d");
			TheContext.putImageData(this.TheImageData,XInPixels1,YInPixels1,0,0,PixelWidth,PixelHeight);	
			
//			this.TheContext.drawImage(TheImage,XInPixels1,YInPixels1,PixelWidth,PixelHeight);		
//			TheView.PaintRefImageScaled(this.TheImage,this.TheBounds);
		}
		else // draw the raster in the upper left corner of the canvas
		{
			TheContext.drawImage(this.TheImageData,0,0,this.TheImage.width,this.TheImage.height);
		}
		if (TheStyle!=undefined) TheView.RestoreStyle();
	}
}


//CanvasMap/js/CMMainContainer.js
/***************************************************************************************
* CMMainContainer Class
*
* Main class to contain the other elements and objects that make up a CMMainContainer.
*
* The elements for a CMMainContainer are held in an array, 
* @module CMMainContainer
* @Copyright HSU, Jim Graham, 2019
***************************************************************************************/
//***************************************************************************************
// Static functions
//***************************************************************************************
// Functions to manage popup windows
//
// There can only be one popup window on the screen at a time.
//***************************************************************************************
/**
* Disable the context menu (regular menu that pops up when the user right-clicks on items in the browser.
* This only appears to work at the document level
*/
document.oncontextmenu = function(event)
{
	event.preventDefault();
	event.stopPropagation();
}
/*
* This function is inserted into event processing so we can hide popup windows when the
* user clicks anywhere in the document.
*/
document.onmousedown=function(TheEvent) 
{ "use strict";
	
	var TargetContainedInPopupWindow=false;
	var TargetIsPopupWindow=false;
	
	// see if the event is in a popup window
	for (var i=0;i<CMMainContainer.PopupWindow.length;i++) 
	{
		TargetContainedInPopupWindow=jQuery.contains( CMMainContainer.PopupWindow[i], TheEvent.target ) ;
		
		if (TheEvent.target===CMMainContainer.PopupWindow[i])
		{
			 TargetIsPopupWindow=true;
		}
	}
	
	if ((TargetContainedInPopupWindow===false)&&(TargetIsPopupWindow===false))
	{
	   CMMainContainer.HidePopupWindows();	
	}
};
document.onmousemove=function(TheEvent) 
{ "use strict";
	if (CMMainContainer.DraggingItem!=undefined)
	{
		if (!TheEvent) { TheEvent=window.event; }
	
		var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,CMMainContainer.DraggingItem);
		var PixelX=Coordinate.x;
		var PixelY=Coordinate.y;
		
		var rect = CMMainContainer.DraggingItem.getBoundingClientRect();
		
		var Top=rect.top;
		
		var Height=PixelY;
		var Width=PixelX;
	
		if (CMMainContainer.Dragging=='s')
		{
			CMMainContainer.DraggingItem.style.height=Height+"px";
			CMMainContainer.DraggingItem.TheCanvasMap.Resize();
		}
		else if (CMMainContainer.Dragging=='e')
		{
			CMMainContainer.DraggingItem.style.width=Width+"px";
			CMMainContainer.DraggingItem.TheCanvasMap.Resize();
		}
		
		
	}
};
document.onmouseup=function(TheEvent) 
{ "use strict";
	if (CMMainContainer.DraggingItem!=undefined)
	{
		CMMainContainer.DraggingItem=undefined;
		CMMainContainer.Dragging=undefined;
		document.body.style.cursor="default";
	}
}

/**
* Sets the current popup window and hides any existing windows
* @public
* @param NewPopupWindow - the DOM element with the visible window
*/
CMMainContainer.SetPopupWindow=function(NewPopupWindow)
{ "use strict";
	CMMainContainer.HidePopupWindows();
	CMMainContainer.PopupWindow.push(NewPopupWindow);
};
/**
* Adds a new popup window.  Existing popup windows will remain open
*/
CMMainContainer.AddPopupWindow=function(NewPopupWindow)
{ "use strict";
	//CMMainContainer.HidePopupWindows();
	CMMainContainer.PopupWindow.push(NewPopupWindow);
};

/**
* Sets the current popup window and hides any existing windows
* @public
*/
CMMainContainer.HidePopupWindows=function() 
{ "use strict";
	for (var i=0;i<CMMainContainer.PopupWindow.length;i++)
	{
		CMMainContainer.PopupWindow[i].style.visibility="hidden";
	}
	CMMainContainer.PopupWindow=[];
};

//***************************************************************************************
// Definitions
// The following definitions should be treated as "static" and should not be 
// modified by users of CMMainContainer
//***************************************************************************************

/**
* Defniitions for the DOM elements within a CMMainContainer
* Indexes into the CMMainContainer.ELEMENT_DEFS array
* @public, @enum
*/
CMMainContainer.MAP_CONTAINER="MapContainer"; // main container with all the panels
CMMainContainer.TOOL_CONTAINER="ToolContainer"; // tools above map
CMMainContainer.TOOL_EDIT="ToolEdit"; // arrow tool
CMMainContainer.TOOL_INFO="ToolInfo"; /// "i" tool
CMMainContainer.TOOL_PAN="ToolPan"; // hand tool
CMMainContainer.CANVAS_CONTAINER="CanvasContainer"; // container for the canvas object
CMMainContainer.CANVAS="Canvas"; 
CMMainContainer.LAYER_LIST="LayerList"; // list of layers contained within the TAB_CONTAINER
CMMainContainer.MAP_FOOTER="MapFooter"; // footer with coordinates, SRS, and authors
CMMainContainer.MAP_COORDINATES="MapCoordinates";
CMMainContainer.MAP_SRS="SRS"; // 
CMMainContainer.MAP_CREDITS="Credits"; // 
CMMainContainer.NAVIGATION="Navigation"; // navigvation buttons (jjg no longer used)
CMMainContainer.BACKGROUND_LIST="BackgroundList";
CMMainContainer.SEARCH_PANEL="SearchPanel";
CMMainContainer.VERTICAL_TAB_CONTAINER="TabContainer";
CMMainContainer.HORIZIONAL_TAB_CONTAINER="HorizontalTabContainer";
CMMainContainer.SETTINGS_PANEL="SettingsPanel";
CMMainContainer.TIME_EDITOR_PANEL="TimeEditPanel";
CMMainContainer.ATTRIBUTE_PANEL="AttributePanel";
CMMainContainer.TIME_SLIDER_PANEL="TimeSliderPanel";
CMMainContainer.DATA_PANEL="DataPanel";

/**
* Definitions for the mobile device gesture events
*/
CMMainContainer.GESTURE_ZOOM=0.2; // how much to add to the zoom on a pinch event
CMMainContainer.GESTURE_PAN=8; // how many pixels to move the map on a pan event

// Global variable to count the total number of maps created on one web page.
// This value is saved as the index into each CMMainContainer and then incremented each time a map is created. 
// The value is also added to the end of all ElementIDs to make them unique for each map.

CMMainContainer.NumMaps=0; 

// keeps track of a popup windows that are currently displayed so it can be hidden if the
// user clicks anywhere in the document.

CMMainContainer.PopupWindow=[];

/**
* Definitions for the elements within the CMMainContainer.  
* Default for the HTML tag is DIV.
* @private
*/
CMMainContainer.ELEMENT_DEFS=
{
	MapContainer:{
		ID:"CM_MapContainer",
		ClassName:"CM_MapContainer",
	},
	ToolContainer:{
		ID:"CM_ToolContainer",
		ClassName:"CM_ToolContainer",
	},
	ToolEdit:{
		ID:"CM_ToolEdit",
		ClassName:"CM_Tool",
	},
	ToolInfo:{
		ID:"CM_ToolInfo",
		ClassName:"CM_Tool",
	},
	ToolPan:{
		ID:"CM_ToolPan",
		ClassName:"CM_Tool",
	},
	CanvasContainer:{
		ID:"CM_CanvasContainer",
		ClassName:"CM_CanvasContainer",
	},
	Canvas:{
		ID:"CM_Canvas",
		ClassName:"CM_Canvas",
		HTMLTag:"CANVAS",
	},
	LayerList:{
		ID:"CM_LayerList",
		ClassName:"CM_ButtonContent",
	},
	MapFooter:{
		ID:"CM_MapFooter",
		ClassName:"CM_MapFooter",
	},
	MapCoordinates:{
		ID:"CM_MapCoordinates",
		ClassName:"CM_Credits",
	},
	SRS:{
		ID:"CM_SRS",
		ClassName:"CM_Credits",
	},
	Credits:{
		ID:"CM_Credits",
		ClassName:"CM_Credits",
	},
	Navigation:{
		ID:"CM_Navigation",
		ClassName:"CM_Navigation",
	},
	BackgroundList:{
		ID:"CM_BackgroundList",
		ClassName:"CM_ButtonContent",
	},
	SearchPanel:{
		ID:"CM_SearchPanel",
		ClassName:"CM_ButtonContent",
	},
	TabContainer:{
		ID:"CM_TabContainer",
		ClassName:"CM_TabContainer",
	},
	HorizontalTabContainer:{
		ID:"CM_HorizontalTabContainer",
		ClassName:"CM_HorizontalTabContainer",
	},
	SettingsPanel:{
		ID:"CM_SettingsPanel",
		ClassName:"CM_SettingsPanel",
	},
	TimeEditPanel:{
		ID:"CM_TimeEditPanel",
		ClassName:"CM_TimeEditPanel",
	},
	AttributePanel:{
		ID:"CM_AttributePanel",
		ClassName:"CM_AttributePanel",
	},
	TimeSliderPanel:{
		ID:"CM_TimeSliderPanel",
		ClassName:"CM_TimeSliderPanel",
	},
	DataPanel:{
		ID:"CM_DataPanel",
		ClassName:"CM_DataPanel",
	},
}

/**
* Below are the settings definitions.
* @public, @settings
*/
CMMainContainer.SettingDefintions=
{
	MainContainer:
	{
		AllowMouseEvents: { Name:"Allow Mouse Events",Type:CMBase.DATA_TYPE_BOOLEAN, Default:true }, // false to create a static map
		MobileSupported: { Name:"Mobile Supported",Type:CMBase.DATA_TYPE_BOOLEAN, Default:false }, // true to enable jestures on phones and pads
		Scene3D: { Name:"3D Scene",Type:CMBase.DATA_TYPE_BOOLEAN, Default:false }, // true to create a 3D scene instead of a 2D scene
		ImageFolder: { Name:"Image Folder",Type:CMBase.DATA_TYPE_STRING, Default:"../Images/" }, // path to the folder with the images for the main container (e.g. tool icons)
		CoordinateUnits: { Name:"Coordinate Units",Type:CMBase.DATA_TYPE_ENUMERATED,Options:[CMUtilities.COORDINATE_UNITS_DD,CMUtilities.COORDINATE_UNITS_DMS,CMUtilities.COORDINATE_UNITS_METERS,CMUtilities.COORDINATE_UNITS_FEET,CMUtilities.COORDINATE_UNITS_PIXELS,CMUtilities.COORDINATE_UNITS_ZOOM],Default:CMUtilities.COORDINATE_UNITS_DMS}, // Sets the units for the coordinates that appear in the footer
		Resize: { Name:"Resize",Type:CMBase.DATA_TYPE_BOOLEAN, Default:false }, // true to have the map automatically resize when the window is resized
	},
};
//***************************************************************************************
// Constructors
//***************************************************************************************
/**
* Constructor for the main CMMainContainer object
* @public, @constructs
*/
function CMMainContainer() 
{ "use strict";
	CMBase.call(this);

	//*****************************
	// settings (move into settings?)
	
	this.ExistingElements=true; // true when we need to search for existing elements in the DOM
	
	this.Settings=
	{
		MainContainer:
		{
		},
	};
	
	//*****************************
	// other properties
	
	this.Index=CMMainContainer.NumMaps; // set the index for this map
	CMMainContainer.NumMaps++; // increment the index for the next map
	
	this.TheScene=null; // child?
	
	// Array for the elements in the CMMainContainer.  The array entrie will be initialized to undefined
	// when first used.  The user can set the entries to null to prevent an element from being created.
	this.Elements=null;
	
	this.Test=false; // flag for Jim to test stuff without breaking the map
	
	// panel objects for managing the map elements
	
	this.ToolPanel=null;
	this.PanelFooter=null;

	this.PanelSettings=null;
	this.PanelLayerList=null;
	this.PanelBackgrounds=null;
	this.PanelSearch=null;
}
CMMainContainer.prototype=Object.create(CMBase.prototype); // inherit prototype functions from PanelBase()

CMMainContainer.prototype.contructor=CMMainContainer; // override the constructor to go to ours

CMMainContainer.prototype.SetTest=function(New) { this.Test=New; };

//***************************************************************************************
// Private functions 
//***************************************************************************************
/*
* Takes over the mouse wheel.  CMMainContainer adds this as an event handler on initialization.
* @private
*/
CMMainContainer.MouseWheel=function(TheEvent)
{ "use strict";
	var Result; // return result is undefined typically
	
	CMMainContainer.HidePopupWindows(); // static function
	
	var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
	
	var Result=this.TheCanvasMap.TheScene.GetView(0).MouseWheel(TheEvent);
		
	return(Result);
};
/*
* called by Initialize() below to initialize the entries in the Elements[] array that have
* not already been intialized by the user.
* @private
*/
CMMainContainer.prototype.Private_GetElements=function()
{
	// make sure the element dictionary has been created
	
	if (this.Elements==null) this.Elements={};
	
	for (var key in CMMainContainer.ELEMENT_DEFS) // get or create each of the elements
	{
		if (this.Elements[key]===undefined) // the element has not been initlized
		{
			var TheEntry=CMMainContainer.ELEMENT_DEFS[key];
			
			var ElementID=TheEntry.ID+"_"+this.Index;
			
			if (this.ExistingElements) // look for an existing element in the DOM
			{
				this.Elements[key]=document.getElementById(ElementID);
			}
			// the horizontal tab container is optional
			if (key!=CMMainContainer.HORIZIONAL_TAB_CONTAINER)
			{
				if (this.Elements[key]==undefined) // the element has not been created, create it now
				{
					var HTMLTag=CMMainContainer.ELEMENT_DEFS[key].HTMLTag;
					if (HTMLTag==undefined) HTMLTag="DIV";
					
					this.Elements[key]=document.createElement(HTMLTag);
					this.Elements[key].id=ElementID;
				}
				// if the element has a CSS class, set it now
				if (CMMainContainer.ELEMENT_DEFS[key].ClassName!=undefined)  // set the class
				{
					if (this.Elements[key].className=="")
					{
						this.Elements[key].className=CMMainContainer.ELEMENT_DEFS[key].ClassName;
					}
				}
			}
		}
	}
};
//******************************************************************
// CMBase Settings Functions
//******************************************************************

CMMainContainer.prototype.GetSettingsDefinitions=function() 
{
	var Result={};
	
	for (Key in CMMainContainer.SettingDefintions)
	{
		Result[Key]=CMMainContainer.SettingDefintions[Key];
	}

	return(Result); 
}
//***************************************************************************************
// CMMainContainer functions to be called before Initialize() is called.  These functions setup
// connections with the DOM objects and set the behavior of the map.
//***************************************************************************************
/**
* Sets the folder containing the images for the CMMainContainer interface
* Deprecated, use SetSetting("MainContainer","MobileSupported",MobileSupported) instead
* @public
* @param ImageFolder - path to the folder with the images
*/
CMMainContainer.prototype.SetImageFolder=function(ImageFolder)
{  "use strict";
	this.SetSetting("MainContainer","ImageFolder",ImageFolder);
//	this.ImageFolder=ImageFolder; 
};
/** 
* Changes the coordinate units
* Deprecated, use SetSetting("MainContainer","CoordinateUnits",CoordinateUnits) instead
* @public
* @param CoordinateUnits - one of the coordinate definitions:
* - CMUtilities.COORDINATE_UNITS_DD=0;
* - CMUtilities.COORDINATE_UNITS_DMS=1;
* - CMUtilities.COORDINATE_UNITS_METERS=2;
* - CMUtilities.COORDINATE_UNITS_FEET=3;
* - CMUtilities.COORDINATE_UNITS_PIXELS=4; // displays the pixel level coordinates for debugging
* - CMUtilities.COORDINATE_UNITS_ZOOM=5; // displays the zoom level for debugging
*/
CMMainContainer.prototype.SetCoordinateUnits=function(CoordinateUnits) 
{ 
	this.SetSetting("MainContainer","CoordinateUnits",CoordinateUnits);
	
	if (this.PanelFooter!=null) // jjg - needs to move to Set()
	{
		this.PanelFooter.CoordinateUnits=CoordinateUnits;
	}
};

//***************************************************************************************
// Element functions
/*
* Function to provide an existnig element in place of the one that CMMainContainer 
* will create by default.  The user can also specify "null" which will prevent
* the element from being created.
* @public
* @param ElementIndex - CMMainContainer element definition for the element to set (i.e. CMMainContainer.MAP_CONTAINER).
* @param Element - the element to replace the standard CMMainContainer element
*/
CMMainContainer.prototype.SetElement=function(ElementIndex,Element)
{ 
	if (this.Elements==null) this.Elements={};
	
	if (typeof(Element)=="string") // an ID was specified, find the existing element.
	{
		Element=document.getElementById(Element);
	}
	// save the element to replace the default one.
	
	this.Elements[ElementIndex]=Element; 
};
/*
* Get the element from CMMainContainer based on the predefined indexes
* @public
* @param ElementIndex - CMMainContainer element definition for the element to set (i.e. CMMainContainer.MAP_CONTAINER).
* @returns - TheElement the DOM element for the specified element definition or NULL if unavailable.
*/
CMMainContainer.prototype.GetElement=function(ElementIndex)
{ 
	return(this.Elements[ElementIndex]); 
};

/**
* Helper function to turn off all the elements except the main map
*/
CMMainContainer.prototype.SimpleMap=function()
{ 
	this.SetElement(CMMainContainer.TOOL_CONTAINER,null); // turn off the tool bar below the title
	this.SetElement(CMMainContainer.NAVIGATION,null); // turn off the nagivation controls in the map 
	this.SetElement(CMMainContainer.VERTICAL_TAB_CONTAINER,null); // turn off the tab controls to the upper right of the map
	this.SetElement(CMMainContainer.LAYER_LIST,null); // hide the list of layers that is below the tab controls
	this.SetElement(CMMainContainer.BACKGROUND_LIST,null); // hide the background list
	this.SetElement(CMMainContainer.SEARCH_PANEL,null); // hide the search panel
	this.SetElement(CMMainContainer.SETTINGS_PANEL,null); // hide the search panel
	this.SetElement(CMMainContainer.DATA_PANEL,null); // hide the search panel
	this.SetElement(CMMainContainer.MAP_FOOTER,null); // hide the map footer at the bottom of the map
};

//***************************************************************************************
// Private functions
//***************************************************************************************

/*
* This is the function to call to initialize the CMMainContainer.  It sets up the member variables,
* links the objects together, and sets up the event handlers.
* @public 
* @param TheView - Optional 2D or 3D view.  If undefined, a 2D view is created, if true, a 3D view is created.
*/
CMMainContainer.prototype.Initialize=function(TheView)
{
	//if (AllowMouseEvents==undefined) AllowMouseEvents=true;
	
	// get the elements from the web page unless they have already been specified
	this.Private_GetElements();
		
	var ImageFolder=this.GetSetting("MainContainer","ImageFolder");
			
	//*****************************************************
	// setup the scene and view
	
	var TheGeo=null;
	
	if ((TheView==undefined)||(TheView instanceof CMView2D)) // no view specified or provided a 2D view
	{
		this.TheScene=new CMScene(this);
		TheGeo=new CMGeo(this.TheScene);
	
		if (TheView==undefined) TheView=new CMView2D(); // default
//		this.TheScene.AddView(TheView);
//		TheView.Setup(this.Elements[CMMainContainer.CANVAS]);
	}
	else // create a 3D view
	{
		this.TheScene=new CM3Scene();
		TheGeo=new CM3Geo(this.TheScene);
		
		if (((TheView instanceof CM3View)==false) ) //&& ((TheView instanceof CM3Camera)==false)
		{
			TheView=new CM3View( );
		}
	}
	this.TheScene.SetParent(this);
	
	this.TheScene.AddView(TheView);
	this.TheScene.AddChild(TheGeo);
	
	TheView.Setup(this.Elements[CMMainContainer.CANVAS],this.Elements[CMMainContainer.CANVAS_CONTAINER]);
	
	// This is the map container which is provided by the user
	
	var MapContainer=this.Elements[CMMainContainer.MAP_CONTAINER];
	MapContainer.TheCanvasMap=this;
	MapContainer.OriginalMouseDown=MapContainer.onmousedown;

	var CanvasContainer=this.Elements[CMMainContainer.CANVAS_CONTAINER];
	if  (CMUtilities.IsDefined(CanvasContainer)) 
	{
		MapContainer.appendChild(CanvasContainer);
	}
	var TheCanvasElement=this.Elements[CMMainContainer.CANVAS];
	if  (CMUtilities.IsDefined(TheCanvasElement)) 
	{
		CanvasContainer.appendChild(TheCanvasElement);
	}

	//******************************************************
	// tools
	
	var ToolContainer=this.Elements[CMMainContainer.TOOL_CONTAINER];
	if  (CMUtilities.IsDefined(ToolContainer))
	{
		MapContainer.appendChild(ToolContainer);
	}
	
	//**************************************************
	// vertical buttons
	
	var TabContainer=this.Elements[CMMainContainer.VERTICAL_TAB_CONTAINER]; // VERTICAL_TAB_CONTAINER is the content container
	if  (CMUtilities.IsDefined(TabContainer)) 
	{
		this.TabPanel=new CMPanelButtons(this);
		
		this.TabPanel.SetElement(TabContainer);
	
		MapContainer.appendChild(TabContainer);
		
		// panel for layers
		
		var LayerListElement=this.Elements[CMMainContainer.LAYER_LIST];
		if  (CMUtilities.IsDefined(LayerListElement)) 
		{
			this.PanelLayerList=new CMPanelLayerList(this);
		
			var TheLayerListTab=this.TabPanel.AddTab("Layers",ImageFolder+"Icon_Layers.png",undefined,LayerListElement,MapContainer);
			
			this.PanelLayerList.SetElement(LayerListElement); // connect the settings panel to it's DIV element
		}
		
		// panel for background layers
		
		var PanelBackgroundsElement=this.Elements[CMMainContainer.BACKGROUND_LIST];
		if  (CMUtilities.IsDefined(PanelBackgroundsElement)) 
		{
			this.PanelBackgrounds=new CMPanelBackgrounds(this);
		
			var TheBackgroundsTab=this.TabPanel.AddTab("Background",ImageFolder+"Icon_Background_Default.png",null,PanelBackgroundsElement,MapContainer);
			
			this.PanelBackgrounds.SetElement(PanelBackgroundsElement); // connect the settings panel to it's DIV element
		}
		
		// panel for search
		
		var SearchPanelElement=this.Elements[CMMainContainer.SEARCH_PANEL];
		if  (CMUtilities.IsDefined(SearchPanelElement)) 
		{
			this.PanelSearch=new CMPanelSearch(this);
		
			var TheSearchTab=this.TabPanel.AddTab("Search",ImageFolder+"Icon_Search.png",null,SearchPanelElement,MapContainer);
			
			this.PanelSearch.SetElement(SearchPanelElement); // connect the settings panel to it's DIV element
		}
	}

	//************************************************************************
	// Add the tools container
	// The positioning of the tools is set within the CMMainContainer CSS file	
	var ToolContainer=this.GetElement(CMMainContainer.TOOL_CONTAINER);
	if (CMUtilities.IsDefined(ToolContainer))
	{
		// create the tool panel object and link it to its DIV element
		
		this.ToolPanel=new CMPanelTool(this);
		
		this.ToolPanel.SetElement(ToolContainer);
		
		// add the select/arrow tool

		var EditTool=this.GetElement(CMMainContainer.TOOL_EDIT);
		
		if (CMUtilities.IsDefined(EditTool))
		{
			var TheTool=this.ToolPanel.AddTool(EditTool,ImageFolder+"IconArrow_20w_Default.png",
				ImageFolder+"IconArrow_20w_Selected.png",this,
				'Click to get information on features or drag the map',function(TheCanvasMap) 
			{ 
				TheCanvasMap.SelectTool(CMView.TOOL_SELECT); // create a new select tool
			});
			TheTool.CMMainContainer=this;
		}
		
		// add the select/arrow tool
		
		var PanTool=this.GetElement(CMMainContainer.TOOL_PAN);
		
		if (CMUtilities.IsDefined(PanTool))
		{
			var TheTool=this.ToolPanel.AddTool(PanTool,ImageFolder+"IconHand_20w_Default.png",
				ImageFolder+"IconHand_20pixels_Selected.png",this,
				'Click to get information on features or drag the map',function(TheCanvasMap) 
			{ 
				TheCanvasMap.SelectTool(CMView.TOOL_HAND); // create a new select tool
			});
			TheTool.CMMainContainer=this;
		}
		
		// add the select/arrow tool
		
		var InfoTool=this.GetElement(CMMainContainer.TOOL_INFO);
		
		if (CMUtilities.IsDefined(InfoTool))
		{
			var TheTool=this.ToolPanel.AddTool(InfoTool,ImageFolder+"Icon_I_Default.png",
				ImageFolder+"Icon_I_Selected.png",this,
				'Click to get information on features or drag the map',function(TheCanvasMap) 
			{ 
				TheCanvasMap.SelectTool(CMView.TOOL_INFO); // create a new select tool
			});
			TheTool.CMMainContainer=this;
		}
		this.ToolPanel.MakeToolGroup([EditTool,PanTool,InfoTool]);
		
		// add zoom in tool
		
		var ZoomInButton=document.createElement("DIV");
		ZoomInButton.id="CMZoomIn_0";
		ZoomInButton.className="CM_Tool";
		
		var TheTool=this.ToolPanel.AddTool(ZoomInButton,ImageFolder+"Icon_ZoomIn_Small_17H.png",
			ImageFolder+"Icon_ZoomIn_Small_17H.png",this,
			'Click to zoom into the map',function(TheCanvasMap) 
		{ 
			this.CMMainContainer.GetScene().GetView(0).ZoomIn();
		});
		TheTool.CMMainContainer=this;
		
		// add home button
		
		var HomeButton=document.createElement("DIV");
		HomeButton.id="CMHome_0";
		HomeButton.className="CM_Tool";
		
		var TheTool=this.ToolPanel.AddTool(HomeButton,ImageFolder+"Icon_HomeExtent_small_17H.png",
			ImageFolder+"Icon_HomeExtent_small_17H.png",this,
			'Click to zoom to the full extent of the map',function(TheCanvasMap) 
		{ 
			this.CMMainContainer.GetScene().GetView(0).ZoomToMaxBounds();
		});
		TheTool.CMMainContainer=this;
		
		// add zoom out tool
		
		var ZoomOutButton=document.createElement("DIV");
		ZoomOutButton.id="CMZoomOut_0";
		
		var TheTool=this.ToolPanel.AddTool(ZoomOutButton,ImageFolder+"Icon_ZoomOut_Small_17H.png",
			ImageFolder+"Icon_ZoomOut_Small_17H.png",this,
			'Click to zoom out of the map',function(TheCanvasMap) 
		{ 
			this.CMMainContainer.GetScene().GetView(0).ZoomOut();
		});
		TheTool.CMMainContainer=this;
		
		this.ToolPanel.MakeToolGroup([ZoomInButton,HomeButton,ZoomOutButton]);
	}
	//*****************************************************************************
	// footer
	
	var MapFooter=this.Elements[CMMainContainer.MAP_FOOTER];
	if  (CMUtilities.IsDefined(MapFooter)) 
	{
		// create the tool panel object and link it to its DIV element
		
		this.PanelFooter=new CMPanelFooter(this);
		
		this.PanelFooter.SetElement(MapFooter);
		
		MapContainer.appendChild(MapFooter);
	}
	// horiziontal tab container
	
 	var HoriziontalTabContainerElement=this.Elements[CMMainContainer.HORIZIONAL_TAB_CONTAINER];
	if  (CMUtilities.IsDefined(HoriziontalTabContainerElement)) 
	{
		// create the horizontal tab panel container
		
		this.HoriziontalTabContainer=new CMPanelTabs(this);
		this.HoriziontalTabContainer.SetElement(HoriziontalTabContainerElement);
		
		// time editor
		var TimeEditorPanelElement=this.Elements[CMMainContainer.TIME_EDITOR_PANEL];
		if  (CMUtilities.IsDefined(TimeEditorPanelElement)) 
		{
			this.PanelTimeline=new CMPanelTime(this);
			this.PanelTimeline.SetElement(TimeEditorPanelElement);
		
			var TimeEditorTab=this.HoriziontalTabContainer.AddTab("Timeline","Timeline",null,TimeEditorPanelElement);
		}
		// settings
		
	 	var SettingsPanelElement=this.Elements[CMMainContainer.SETTINGS_PANEL];
		if  (CMUtilities.IsDefined(SettingsPanelElement)) 
		{
			this.PanelSettings=new CMPanelSettings(this);
			this.PanelSettings.SetElement(SettingsPanelElement);
		
			var SettingsTab=this.HoriziontalTabContainer.AddTab("Settings","Settings",null,SettingsPanelElement);
		
			// link the settings panel to the TimeEditorPanal (jjg - use messages instead?)
			
			if (this.PanelTimeline!=null)
			{
				this.PanelTimeline.SetSettingsPanel(this.PanelSettings); // connect the settings panel to the time editor panel
			}
		}
		// attributes
		
	 	var AttributePanelElement=this.Elements[CMMainContainer.ATTRIBUTE_PANEL];
		if  (CMUtilities.IsDefined(AttributePanelElement)) 
		{
			var TheAttributePanel=new CMPanelAttributes(this);
			TheAttributePanel.SetElement(AttributePanelElement);
		
			var AttributesTab=this.HoriziontalTabContainer.AddTab("Attributes","Attributes",null,AttributePanelElement);
		}
		
		// data
		
	 	var DataPanelElement=this.Elements[CMMainContainer.DATA_PANEL];
		if  (CMUtilities.IsDefined(DataPanelElement)) 
		{
			var TheDataPanel=new CMPanelData(this);
			TheDataPanel.SetElement(DataPanelElement);
		
			var DataTab=this.HoriziontalTabContainer.AddTab("Data","Data",null,DataPanelElement);
		}
		
	}
	
	//*****************************************************
	// call jQuery to add the mouse handles to the canvas element
	
	if (this.GetSetting("MainContainer","AllowMouseEvents",true))
	{
		TheView.AddMouseEventHandlers();
		TheView.AddKeyEventHandlers();
	}
	//*************************************************************************************
	//add events for the map container
	
	MapContainer.addEventListener("mousemove",function(TheEvent) 
	{
		if (!TheEvent) { TheEvent=window.event; }
	
		var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this);
		var PixelX=Coordinate.x;
		var PixelY=Coordinate.y;
		
		var Height=this.offsetHeight;
		var Width=this.offsetWidth;
		
		if (Math.abs(Height-PixelY)<10) 
		{
			this.style.cursor="s-resize";
		}
		else if (Math.abs(Width-PixelX)<10) 
		{
			this.style.cursor="e-resize";
		}
		else 
		{
			this.style.cursor="default";
		}
	});
	MapContainer.addEventListener("mousedown",function(TheEvent) 
	{
		if (!TheEvent) { TheEvent=window.event; }
	
		var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this);
		var PixelX=Coordinate.x;
		var PixelY=Coordinate.y;
		
		var Height=this.offsetHeight;
		var Width=this.offsetWidth;
		
		if (Math.abs(Height-PixelY)<10) 
		{
			CMMainContainer.DraggingItem=this;
			CMMainContainer.Dragging='s';
			document.body.style.cursor="s-resize";
		}
		else if (Math.abs(Width-PixelX)<10) 
		{
			CMMainContainer.DraggingItem=this;
			CMMainContainer.Dragging='e';
			document.body.style.cursor="e-resize";
		}
		else 
		{
			document.body.style.cursor="default";
		}
	});
		
	//*********************************************************
	// setup gesture support using hammer.js
	
	var CanvasContainer=this.GetElement(CMMainContainer.CANVAS_CONTAINER);

	if (this.GetSetting("MainContainer","MobileSupported"))
	{
		TheView.AddMobileEvents();
	}
};
//***************************************************************************************
// CMBase Functions
//***************************************************************************************

/**
* Sets an individual setting value into the settings
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Value - value for the type (see the documentation for types for each of the properties)
*/
CMMainContainer.prototype.SetSetting=function(Group,Key,Value)
{
	try
	{
		this.Settings[Group][Key]=Value; // save them into the object
	}
	catch(err)
	{
		CMMainContainer.Error("Sorry, we could not find the group '"+Group+"' or the Key '"+Key+"' in this objects settings");
	}
//	this.SettingsChanged();
}
/**
* Get an individual value from the settings
* @public
* @param Group - Group for the setting
* @param Key - on of the CMLayer.INFO enumerated types
* @param Default - default value to use in none has been specified as of yet (optional)
* @returns Value - curnet property value.
*/
CMMainContainer.prototype.GetSetting=function(Group,Key,Default)
{
	var Result=CMMainContainer.SettingDefintions[Group][Key].Default;
	
	if (Default!=undefined) Result=Default;
	
	var TheGroup=this.Settings[Group];
	
	if (TheGroup!=undefined)
	{
		if (Key in TheGroup) Result=TheGroup[Key];
	}
	return(Result);
}
//***************************************************************************************
// CMMainContainer functions that can be called after initialize()
//***************************************************************************************

//***************************************************************************************
// Gets and sets

/**
* Get the scene object that contains the layers for the map
* @public
* @returns TheScene - the current scene for this map.
*/
CMMainContainer.prototype.GetScene=function() { return(this.TheScene); };

/**
* Get the view for the CMMainContainer.  When using more than one view, 
* get the scene and then use the Scene's GetNumViews() and GetView(Index)
* functions.
*
* @public
* @returns TheView - the current view for this scene.
*/
CMMainContainer.prototype.GetView=function() { return(this.TheScene.GetView(0)); };

CMMainContainer.prototype.GetToolPanel=function() { return(this.ToolPanel); };

CMMainContainer.prototype.GetPanelFooter=function() { return(this.PanelFooter); };

CMMainContainer.prototype.GetPanelSettings=function() { return(this.PanelSettings); };

CMMainContainer.prototype.SetPanelSettings=function(NewPanelSettings) { this.PanelSettings=NewPanelSettings; };

CMMainContainer.prototype.GetPanelTimeline=function() { return(this.PanelTimeline); };


/**
* Set the projection for coordinate conversion
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CMMainContainer.prototype.SetProjector=function(TheProjector) { this.TheScene.SetProjector(TheProjector); };
CMMainContainer.prototype.GetProjector=function() { return(this.TheScene.GetProjector()); };

/**
* Set the current tool selected for interacting with the map
* @public
* @param ViewToolDef - sets the current tool (e.g. CMView.TOOL_INFO)
*/
CMMainContainer.prototype.SelectTool=function(ViewToolDef) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.SelectTool() cannot be called until after Initialize() is called()"); }
	this.TheScene.GetView(0).SetTool(ViewToolDef);
};
//***************************************************************************************
// Add layers

/*
* Add a layer to the map.  The layer will be on top of other layers
* @public
* @param NewLayer - CMLayer object to add to the map
*/
CMMainContainer.prototype.AddLayer=function(NewLayer) 
{ 
	var LayerIndex=-1;
	
	if (this.TheScene==null) { alert("Sorry, CMMainContainer.AddLayer() cannot be called until after Initialize() is called()"); }
	else 
	{
		LayerIndex=this.TheScene.AddLayer(NewLayer);
	}
	return(LayerIndex);
};
/*
* Add background to the list
* @public
* @param NewLayer - CMLayer object to add to the backgrounds.  Only one background will
*  appear and it will always be behind the other layers.
*/
CMMainContainer.prototype.AddBackground=function(NewLayer) 
{ 
	if (this.TheScene==null) { alert("Sorry, CMMainContainer.AddBackground() cannot be called until after Initialize() is called()"); }
	else 
	{
		this.TheScene.AddBackground(NewLayer);
	}
};
/*
* Add background to the list
* @public
* @param NewLayer - CMLayer object to add to the backgrounds.  Only one background will
*  appear and it will always be behind the other layers.
*/
CMMainContainer.prototype.AddBackgrounds=function(Backgrounds,SelectedIndex) 
{ 
	var TheScene=this.GetScene();
	
	var Layer_World;
	
	for (var i=0;i<Backgrounds.length;i++)
	{
		Layer_World=new CMLayerDataset();
		
		TheScene.AddBackground(Layer_World);
		Layer_World.SetSetting("Item","Name",Backgrounds[i].Name);
		
		// only make the layer hidden if it is not selected
		if (i!=SelectedIndex) Layer_World.SetSetting("Item","Status",CMItem.STATUS_HIDDEN);

		if (Backgrounds[i].NorthPoleColor!=undefined) Layer_World.SetSetting("Dataset","NorthPoleColor",Backgrounds[i].NorthPoleColor);
		if (Backgrounds[i].SouthPoleColor!=undefined) Layer_World.SetSetting("Dataset","SouthPoleColor",Backgrounds[i].SouthPoleColor);
		Layer_World.SetSetting("Layer","Metadata",Backgrounds[i].Metadata);
		Layer_World.SetSetting("Dataset","URL",Backgrounds[i].URL);
		Layer_World.SetSetting("Dataset","Format",Backgrounds[i].Format);
		
		Layer_World.RequestData();
	}
	
	TheScene.SetSelectedBackgroundIndex(SelectedIndex);
}

//********************************************************************************
// StartMap function
//********************************************************************************

/*
* StartMap() should be called after all the layers are added to start up the map and
* fill out the layer list.  Layers can be added and removed later as well but the user
* may see them being added.
* @public
* @param ResizeFlag - If true, the map will be resized right away.  Otherwise, the size
*  of the canvas map container will be used for the canvas.
*/
CMMainContainer.prototype.StartMap=function(ResizeFlag) 
{
	if ((typeof(CM3Scene)!="undefined")&&(this.TheScene instanceof CM3Scene))
	{
		this.TheScene.Start();
	}
	// select layers tab to start
	
	if  (CMUtilities.IsDefined(this.TabPanel)) 
	{
//		this.TabPanel.SelectTab("Layers");
	}
	// setup resize
	
	if (ResizeFlag) 
	{
		this.Resize();
	}
	else 
	{
		// the canvas aspect ratio is not correct unless we set the "width" and "height" of the element
		// rather than the style.  This must be done or it will display maps distorted
		
		this.TheScene.Resize();
	}
	var Resize=this.GetSetting("MainContainer","Resize");
	if (Resize)
	{
		window.MainContainer=this; // jjg - not sure this is okay
		
		// add the resize function to the window
		window.addEventListener("resize", function() {
			this.MainContainer.Resize();
		});
		
		// call the resize function to setup the map for the first time
		this.Resize();
	}
};

//*************************************************************************************
// Functions called by GUI widgets
//*************************************************************************************
/*
* called to zoom the map in by 2x
* @public
*/
CMMainContainer.prototype.ZoomIn=function() 
{
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomIn() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomIn();
};
/*
* called to zoom the map out by 2x
* @public
*/
CMMainContainer.prototype.ZoomOut=function() 
{
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomOut() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomOut();
};
/**
* Zooms the map to the maximum specified value
* @public
*/
CMMainContainer.prototype.ZoomToMax=function() 
{
	var SceneBounds=this.TheScene.GetBounds();
	
	if (SceneBounds!=null)
	{
		this.TheScene.GetView(0).ZoomToBounds(SceneBounds);
	}
};
/*
* called to zoom the map to a specific area of the scene.
* @public
* @param TheBounds - boundary object { XMin,XMax,YMin,YMax}
*/
CMMainContainer.prototype.ZoomToBounds=function(TheBounds) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomToBounds() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomToBounds(TheBounds); 
};
/**
* Zooms to the specified zoom level
* @public
* @param ZoomLevel - level to zoom to, 1=1 pixel per map unit, 2=pixels per map unit, etc.)
*/
CMMainContainer.prototype.ZoomTo=function(ZoomLevel) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.ZoomTo() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).ZoomTo(ZoomLevel); 
};
/**
* Centers the map at RefX,RefY in the first view
* @public
* @param RefX - Longitude or easting for the center of the map
* @param RefY - Latitude or northing for the center of the map
*/
CMMainContainer.prototype.SetRefCenter=function(RefX,RefY) 
{ 
	if (this.TheScene.GetView(0)==null) { alert("Sorry, CMMainContainer.SetRefCenter() cannot be called until after Setup() is called()"); }
	else this.TheScene.GetView(0).SetRefCenter(RefX,RefY); 
};

/**
* Called to resize the map when the window size changes.  
* The only reason this is needed is because
* we have to use JavaScript to resize the Canvas HTML element, CSS does not work.
* @public
*/
CMMainContainer.prototype.Resize=function() 
{
	CMMainContainer.HidePopupWindows();
	
	this.TheScene.Resize();
};
CMMainContainer.Error=function(Message) 
{
	throw(Message);
//	alert("Message");
};

//CanvasMap/js/CMNorthArrow.js
/******************************************************************************************************************
* CMNorthArrow
* Class for creating north arrows that can point north.  The north arrows are provided by SVG
* files.
*
* @module CMNorthArrow
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//***************************************************************************************
// Global Definitions
//***************************************************************************************
CMNorthArrow.SettingDefintions=
{
	NorthArrow:
	{
		Scale: { Name:"Scale",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		ClassName: { Name:"Class Name",Type:CMBase.DATA_TYPE_STRING, Default:"CM_NorthArrow" }, // link to the SVG file that contains the arrow
		URL: { Name:"URL",Type:CMBase.DATA_TYPE_STRING, Default:null },
	},
}

//***************************************************************************************
// Constructors
//***************************************************************************************
/*
* 
*/
function CMNorthArrow() 
{
	CMItem.call(this);
	
	// settings
	this.TimeSlices[0].Settings.NorthArrow=	
	{
	};
	// other properties
	this.AngleInRadians=0;
	
	this.OriginalWidth=0;
	this.OriginalHeight=0;
}

CMNorthArrow.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMBase()

CMNorthArrow.prototype.contructor=CMNorthArrow; // override the constructor to go to ours


//******************************************************************
// Private functions
//******************************************************************
/**
* @private
*/
CMNorthArrow.prototype.SetupAngle=function(TheView)
{
	this.AngleInRadians=0;
	
	if (this.TheContainer!=undefined)
	{
		var TheMainContainer=this.GetParent(CMMainContainer);
		var TheProjector=TheMainContainer.GetProjector();
		
		var TheNorthArrow=this.TheContainer.childNodes[0];
		
		var TheRect=this.TheContainer.getBoundingClientRect();
		
		var CenterX=this.TheContainer.offsetLeft+(this.TheContainer.offsetWidth)/2;
		var CenterY=this.TheContainer.offsetTop+(this.TheContainer.offsetHeight)/2;
		
		var Easting=TheView.GetRefXFromPixelX(CenterX);
		var Northing1=TheView.GetRefYFromPixelY(CenterY-5);
		var Northing2=TheView.GetRefYFromPixelY(CenterY+5);
		
		if (isNaN(Easting)||isNaN(Northing1)||isNaN(Northing2))
		{
			this.AngleInRadians=0;
		}
		else
		{
			var Result1=TheProjector.ProjectToGeographic(Easting,Northing1);
			var Result2=TheProjector.ProjectToGeographic(Easting,Northing2);
			
			if ((Result1!=null)&&(Result2!=null))
			{
				var angleRadians = Math.atan2( Result2[0] - Result1[0],Result2[1] - Result1[1]);
			
				this.AngleInRadians=Math.PI-angleRadians;
			}
		}
	}
}
/**
* Sets the transform to rotate the north arrow based on the map projection and location
* @private
*/
CMNorthArrow.prototype.SetTransform=function()
{
	if (this.TheContainer!=undefined)
	{
		var TheGraphic=this.TheContainer.childNodes[0];
		
		if (TheGraphic!=undefined)
		{
			var AngleInDegrees=this.AngleInRadians*180/Math.PI;
			
			var Width=TheGraphic.clientWidth;
			var Height=TheGraphic.clientHeight;
			
			var Scale=this.GetSetting("NorthArrow","Scale",1);
			
			// get the amount to translate the graphic to keep it within the container
			var TranslateX=this.OriginalWidth/2*(Scale-1);//this.OriginalWidth/Scale; // 0 at Scale=1, 32 at Scale=2, 64 at Scale=3, 96 at Scale=4
			var TranslateY=this.OriginalHeight/2*(Scale-1);//this.OriginalHeight/Scale;
			
			var Transform=" translate("+TranslateX+","+TranslateY+") scale("+Scale+") rotate("+AngleInDegrees+")";
			
			TheGraphic.setAttribute("transform",Transform );
			
			// setup the width and height of the container
			var Width=Width*Scale;
			var Height=Height*Scale;
			
	//		this.TheContainer.style.top=TranslateY+"px";
	//		this.TheContainer.style.left=TranslateX+"px";
			
//			this.TheContainer.style.zIndex = "1000";
//			this.TheContainer.style.border = "thick solid #0000FF";
			
			this.TheContainer.style.width=Width+"px";
			this.TheContainer.style.height=Height+"px";
		}
	}
}
/**
* Sets up the north arrow the first time it is used
* @private
*/

CMNorthArrow.prototype.SetupNorthArrow=function()
{
	var TheMainContainer=this.GetParent(CMMainContainer);
	var TheCanvasContainer=TheMainContainer.GetElement(CMMainContainer.CANVAS_CONTAINER);
	
	if (this.TheContainer==undefined)
	{
		// add the DIV container
		
		var TheContainer=document.createElement("div");
		TheContainer.className=this.GetSetting("NorthArrow","ClassName","CM_NorthArrow");
		
		TheCanvasContainer.appendChild(TheContainer);
		
		this.TheContainer=TheContainer;
//		this.TheContainer.style.zIndex = 99999999;
//		this.TheContainer.style.border = "thick solid #ff00FF";

		TheContainer.innerHTML=this.SVGText;
		
		var TheGraphic=this.TheContainer.childNodes[0];
		
		this.OriginalWidth=TheGraphic.clientWidth;
		this.OriginalHeight=TheGraphic.clientHeight;
		
		this.SetTransform();
		
		// setup the container to match the svg graphic
		
		// add the SVG element to the Div container
/*		
		var TheSVGElement=document.createElement("svg");
		TheSVGElement.width=Width;
		TheSVGElement.height=Height;
		TheSVGElement.setAttribute("transform", "scale(4)");
		
		TheContainer.appendChild(TheSVGElement);
		
		this.SVGElement=TheSVGElement;
		
		// add the text item
		
		var TheTextElement=document.createElement("text");
		TheTextElement.x="120";
		TheTextElement.y="150";
		TheTextElement.stroke="black";
		TheTextElement.strokeWidth="1";
		TheTextElement.fill="white";
		TheTextElement.pointerEvents="visible";
		
		TheTextElement.innerHTML=this.SVGText;
		TheTextElement.setAttribute("transform", "scale(4)");
		
		TheSVGElement.appendChild(TheTextElement);
		this.TheTextElement=TheTextElement;
*/		
	}
	
/*	var TheArray=CMNorthArrow.Coordinates;
	
	var ctx=TheView.TheContext;
	
	ctx.translate(this.x,this.y);
	ctx.rotate(this.AngleInRadians);
	
	ctx.moveTo(+TheArray[0][0],TheArray[0][1]);
										  
	for (var i=0;i<TheArray.length;i++)
	{
		ctx.lineTo(TheArray[i][0],TheArray[i][1]);
	}
	ctx.fill();
	ctx.stroke();
	
	ctx.rotate(-this.AngleInRadians);
	ctx.translate(-this.x,-this.y);
*/	
}
//******************************************************************
// CMBase functions
//******************************************************************
CMNorthArrow.prototype.CMItem_GetSettingsDefinitions=CMItem.prototype.GetSettingsDefinitions; // save the superclass function

CMNorthArrow.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMItem_GetSettingsDefinitions(); // get the settings definitions from the superclass
	
	for (Key in CMNorthArrow.SettingDefintions)
	{
		Result[Key]=CMNorthArrow
		.SettingDefintions[Key];
	}

	return(Result); 
}

//******************************************************************
// CMItem functions
//******************************************************************

CMNorthArrow.prototype.Paint=function(TheView)
{
	if (this.TheContainer!=undefined)
	{
		this.SetupAngle(TheView);
		
		this.SetTransform();
	}
}
//******************************************************************
// CMNorthArrow functions
//******************************************************************
CMNorthArrow.prototype.RequestData=function() 
{
	var URL=this.GetSetting("NorthArrow","URL");
	this.SetURL(URL);
}

/*
* Called to obtain the data for the layer from a URL.
* Currently,only GeoJSON is supported as the transfer type.
* @private
*/
CMNorthArrow.prototype.SetURL=function(URL) 
{
	this.URL=URL;
	
	var TheRequest=new XMLHttpRequest(); // wait staff at the resturant
	TheRequest.open("GET",URL,true); // the URL is what we ordered
	TheRequest.TheURL=URL;
	TheRequest.ThisNorthArrow=this;
			
	TheRequest.onreadystatechange=function() 
	{
		if (this.readyState == 4)  // done
		{
			if (this.status == 200) // OK
			{
				this.ThisNorthArrow.SVGText=TheRequest.responseText;
				
				this.ThisNorthArrow.SetupNorthArrow();
			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
};






//CanvasMap/js/CMPanelBackgrounds.js
/******************************************************************************************************************
* SetupSettingsPanel
*
* @module SetupSettingsPanel
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
/*-- Changes check box size and margin --*/
CMPanelBackgrounds.LAYER_LIST_ITEM_HEIGHT=24;
CMPanelBackgrounds.LAYER_POPUP_MENU_ITEM_HEIGHT=24;

//******************************************************************
// Constructor
//******************************************************************

function CMPanelBackgrounds(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelBackgrounds requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	var TheScene=TheCanvasMap.GetScene();
	TheScene.AddListener(CMScene.MESSAGE_BACKGROUNDS_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.Setup(TheScene);
	});
	
	// Properties
	this.TheElement=null;
	
	this.LayerListItemHeight=CMPanelBackgrounds.LAYER_LIST_ITEM_HEIGHT;
	this.LayerPopupMenuItemHeight=CMPanelBackgrounds.LAYER_POPUP_MENU_ITEM_HEIGHT;
}

CMPanelBackgrounds.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelBackgrounds.prototype.contructor=CMPanelBackgrounds; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************

//******************************************************************
// Functions
//******************************************************************

CMPanelBackgrounds.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
}
/**
* Setup the properties panel for a selected object
*/
CMPanelBackgrounds.prototype.Setup=function(TheScene)
{
	var TheElement=this.TheElement;
	
	// first, remove all the existing elements from the element
	while (TheElement.firstChild) // while there is a first element in the dialog
	{
		// removing the first element moves the next element to the first position
		// so this little loop will remove all the elements from another element
		TheElement.removeChild(TheElement.firstChild);
	}
	
	var Left=TheElement.style.left;
	var Top=TheElement.style.top;
	
	// TheElement.style.borderColor="#cccccc"; // border color for the layers list. style moved to CanvasMap.css.
	Left=0;
	Top=6;
	var TheGeo=TheScene.GetChild(0,CMGeo);
	
	for (var i=0;(i<TheGeo.GetNumBackgrounds());i++)
	{
		var TheBackground=TheGeo.GetBackground(i);
		
		var LayerInListTop=Top+(i*this.LayerListItemHeight);
		
		// create the overall div tag for the layer in the list
		
		var LayerInList=document.createElement('div');
		LayerInList.className="CM_BackgroundListItemClass";
	
		var LayerListWidth=jQuery(TheElement).outerWidth(false);
	
		CMUtilities.AbsolutePosition(LayerInList,Left+2,LayerInListTop,LayerListWidth,this.LayerListItemHeight);
		
		TheElement.appendChild(LayerInList);
	
		//*******************************************************
		// add the check box
		
		var TheCheckBox=document.createElement('input');
		TheCheckBox.className="CM_BackgroundListRadioButtonClass";
		TheCheckBox.name="Background";
		TheCheckBox.value=TheBackground.Name;
		TheCheckBox.type="radio";
//		TheCheckBox.style.width="20%";
		
		TheCheckBox.TheGeo=TheGeo;
		TheCheckBox.TheBackground=TheBackground;
		TheCheckBox.ThisIndex=i;
		
		TheCheckBox.addEventListener('click', function()
		{
			if (this.checked)
			{
				this.TheGeo.SetSelectedBackgroundIndex(this.ThisIndex);
			}
		});
		TheCheckBox.checked=false;
		
		if (TheGeo.SelectedBackgroundIndex==i) TheCheckBox.checked=true;
		
		// debugging
	
		CMUtilities.AbsolutePosition(TheCheckBox,Left+2,-6,14,this.LayerListItemHeight);
		
		// Sets the position of the check boxes
		
		LayerInList.appendChild(TheCheckBox);

		//****************************************************************
		// add the name
		
		var TheLayerName=document.createElement('div');
		TheLayerName.className="CM_BackgroundListNameClass";
		
		var Name=TheBackground.GetSetting("Item","Name","Unnamed"); 
		
		TheLayerName.innerHTML=Name;
		
		//***************************************************************************
		// event listener for when the user right clicks on the list
		// - regular click is for moving, right click for opening the menu
		
		TheLayerName.TheLayer=TheBackground;
		TheLayerName.addEventListener('mousedown', function(event)
		{
			if (event.button!=0) // right mouse button was pressed, display the popup menu
			{
				//*******************************************************************
				// Create the popup menu if it has not been created already and remove it's contents
				// we use one LayerPopupMenu element for all layers and 
				// just change it's contents when it is selected
				
				var TheMetadata=this.TheLayer.GetSetting("Layer","Metadata");
				
				if (TheMetadata!=undefined)
				{
					var ThePopupMenu=CMUtilities.GetPopupMenu("CM_LayerPopupMenu",event.clientX,event.clientY);
				
					this.TheLayer.AddMetadataMenuItem(ThePopupMenu);
				}
			}
			
			event.stopPropagation(); // stop the document from hidding a popup window
			event.preventDefault(); // keeps regular menu from appearing
			return(false); // old way to keep regular menu from appearing (not sure this is needed)
		});
		//*******************************************************************
		CMUtilities.AbsolutePosition(TheLayerName,Left+30,0,150,this.LayerListItemHeight);
	
		//*******************************************************************
		LayerInList.appendChild(TheLayerName);
	}
};
//CanvasMap/js/CMPanelFooter.js
/******************************************************************************************************************
* CMPanelFooter
*
* @module CMPanelFooter
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************
function CMPanelFooter(TheMainContainer) 
{
	CMBase.call(this);

	if (TheMainContainer==undefined) alert("Sorry, the CMPanelFooter requires a CanvasMap object on construction");
	
	this.SetParent(TheMainContainer);
	
	this.CoordinateUnits=CMUtilities.COORDINATE_UNITS_DD;
	
	var TheScene=TheMainContainer.GetScene();
	
	this.TheMainContainer=TheMainContainer;
	
	for (var i=0;i<TheScene.GetNumViews();i++)
	{
		var TheView=TheScene.GetView(i);
	
		TheView.AddListener(CMView.MESSAGE_MOUSE_MOVE,this,function(TheView,ThePanelFooter,AdditionalInfo)
		{
			if (TheView instanceof CMView2D)
			{
				TheEvent=AdditionalInfo;
				
				if (ThePanelFooter.TheCoordinates!=undefined)
				{
					var Text=TheView.GetCoordinateStringFromEvent(TheEvent,ThePanelFooter.CoordinateUnits);
				
					if (Text=="") Text=" ";
					ThePanelFooter.TheCoordinates.innerHTML=Text;
				}
			}
			else
			{
				var TheRayTracer=AdditionalInfo.TheRayTracer;
				
				var planeZ = new THREE.Plane(new THREE.Vector3(0,0,1),0); //default plane should be ((1,0,0), 0)
				var intersects = new THREE.Vector3();
				TheRayTracer.ray.intersectPlane(planeZ, intersects);
			
				var Text=intersects.x.toFixed(7)+", "+intersects.y.toFixed(7);
				
				ThePanelFooter.TheCoordinates.innerHTML=Text;
				
			}
		});
	}
}

CMPanelFooter.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelFooter.prototype.contructor=CMPanelFooter; // override the constructor to go to ours

//******************************************************************
// private Functions
//******************************************************************
/**
* @private
*//*
CMPanelFooter.prototype.GetCoordinateString=function(RefX,RefY,TheMainContainer)
{
	var TheView=TheMainContainer.GetView();
	var TheProjector=TheMainContainer.GetProjector();
	
	var Result=CMUtilities.GetCoordinateString(RefX,RefY,this.CoordinateUnits,TheProjector,TheView);
	return(Result);
}*/

//******************************************************************
// Functions
//******************************************************************
CMPanelFooter.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
	
	var TheTable= document.createElement("TABLE"); 
	TheTable.width="100%";
	
	// Create an empty <tr> element and add it to the 1st position of the table:
	var TheRow=TheTable.insertRow(0);
	
	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var LeftCell=TheRow.insertCell(0);
	var RightCell=TheRow.insertCell(1);
	
	// Add some text to the new cells:
	
	this.TheCredits= document.createElement("DIV"); 
	this.TheCredits.className="CM_Credits";
	
	RightCell.appendChild(this.TheCredits);
	RightCell.style.align="right";
	
	//******************************************************
	
	var TheTable2=document.createElement("TABLE"); 
	
	// Create an empty <tr> element and add it to the 1st position of the table:
	var TheRow1=TheTable2.insertRow(0);
	
	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var TopLeftCell=TheRow1.insertCell(0);
	
	this.TheCoordinates= document.createElement("DIV"); 
	this.TheCoordinates.className="CM_MapCoordinates";
	
	TopLeftCell.appendChild(this.TheCoordinates);
	
//	if (CMUtilities.IsDefined(this.Elements[CMMainContainer.MAP_COORDINATES]))
	{
		var TheRow2=TheTable2.insertRow(1);
		
		var BottomLeftCell=TheRow2.insertCell(0);
		
		this.TheSRS= document.createElement("DIV"); 
		this.TheSRS.className="CM_SRS";
		
		BottomLeftCell.appendChild(this.TheSRS);
	}
	
	LeftCell.appendChild(TheTable2);
	
	TheElement.appendChild(TheTable);
}

CMPanelFooter.prototype.SetCredits=function(TheText)
{
	this.TheCredits.innerHTML=TheText;
}


//CanvasMap/js/CMPanelLayerList.js
/******************************************************************************************************************
* CMPanelLayerList
*
* @module CMPanelLayerList
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
/*-- Changes check box size and margin --*/
CMPanelLayerList.LAYER_LIST_ITEM_HEIGHT=28;
CMPanelLayerList.LAYER_POPUP_MENU_ITEM_HEIGHT=24;

//******************************************************************
// Constructor
//******************************************************************

/**
* @private
*/
function CMPanelLayerList(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelLayerList requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	var TheScene=TheCanvasMap.GetScene();
	TheScene.AddListener(CMScene.MESSAGE_LAYER_LIST_CHANGED,this,function(TheScene,TheListener,AdditionalInfo)
	{
		TheListener.AddLayerList(TheScene);
	});
	
	// jjg -  move to settings
	this.LayerListItemHeight=CMPanelLayerList.LAYER_LIST_ITEM_HEIGHT;
	this.LayerPopupMenuItemHeight=CMPanelLayerList.LAYER_POPUP_MENU_ITEM_HEIGHT;
	
	// Properties
	this.TheElement=null;
}

CMPanelLayerList.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelLayerList.prototype.contructor=CMPanelLayerList; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************
//******************************************************************
// CMScene functions to create and manage the layer list
// 
// This is a relatively complicated set of code to allow users
// to move, edit, and access properties in the layer list.
// This provides a layer list similar to a GIS application that
// is not appropriate for most web apps.
//******************************************************************
/**
* @private
*/
CMPanelLayerList.prototype.AddLayerToList=function(TheElement,LayerIndex,Left,LayerInListTop,TheScene)
{
	var TheLayer=TheScene.GetChild(0,CMGeo).GetChild(LayerIndex,CMLayer);
	
//	try
	{
		TheLayer.AddToList(TheElement,Left,LayerInListTop,this.LayerListItemHeight);
	}
/*	catch (Error)
	{
		throw(Error);
	}
*/}

//******************************************************************
// Functions
//******************************************************************

CMPanelLayerList.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
}
/**
* Setup the properties panel for a selected object
*/
CMPanelLayerList.prototype.Setup=function(TheObject)
{
	var SettingsPopup=this.TheElement;
	
	while (SettingsPopup.hasChildNodes()) 
	{
		SettingsPopup.removeChild(SettingsPopup.lastChild);
	}
}

/**
* Add the layer list to the specified DOM element.
* This will typically be a div tag in the map page.
* Override to provide your own layer list.
* @protected, @override
* @param TheElement
*/
CMPanelLayerList.prototype.AddLayerList=function(TheScene) 
{
	TheElement=this.TheElement;
	TheElement.LayerListPanel=this;
	
	// first, remove all the existing elements from the element
	while (TheElement.firstChild) // while there is a first element in the dialog
	{
		// removing the first element moves the next element to the first position
		// so this little loop will remove all the elements from another element
		TheElement.removeChild(TheElement.firstChild);
	}
	
	var Left=TheElement.style.left;
	var Top=TheElement.style.top;
	
	// TheElement.style.borderColor="#cccccc"; // border color for the layers list. style moved to CanvasMap.css.
	Left=0;
	Top=0;
	var LayerInListTop=0;
	
	var TheGeo=TheScene.GetChild(0,CMGeo);
	
	for (var i=0;(i<TheGeo.GetNumChildren(CMLayer));i++)
	{
		var LayerInListTop=Top+(i*this.LayerListItemHeight);
		
		this.AddLayerToList(TheElement,i,Left,LayerInListTop,TheScene);
	}
	//**************************************************************************
	//TheElement.style.border="2px solid #00ff00";
		// moving the cursor for the layer
		
	TheElement.addEventListener('mousemove', function(event)
	{
		if (this.DraggingDiv!=null)
		{
			{
				// set the inital position of the div
				
				var TheElementPosition=$(this).offset();
				
				CMUtilities.AbsolutePosition(this.DraggingDiv,0,event.clientY-TheElementPosition.top,200,0);
			}
			event.preventDefault();
			return(false); // old way to keep regular menu from appearing (not sure this is needed)
		}
	});
	//*****************************************************
	// mouse released to move the layer to a new location
	
	TheElement.addEventListener('mouseup', function(event)
	{
		if (this.DraggingDiv!=null) // the user is dragging a layer in the list
		{
			event.preventDefault();
			
			var TheCanvasMap=this.LayerListPanel.GetParent();
			var TheScene=TheCanvasMap.GetScene();
			
			var TheElementPosition=$(this).offset();
			var NewY=event.clientY-TheElementPosition.top;
			var NewIndex=Math.floor(NewY/this.LayerListPanel.LayerListItemHeight);
			TheScene.MoveLayer(this.DraggingLayer,NewIndex);
			
			this.DraggingDiv.style.visibility= "hidden";
			this.DraggingDiv=null;
			
			this.LayerListPanel.AddLayerList(TheScene);
		}
		return(false); // old way to keep regular menu from appearing (not sure this is needed)
	});
	TheElement.addEventListener('mouseleave', function(event)
	{
		if (this.DraggingDiv!=null)
		{
			this.DraggingDiv.style.visibility= "hidden";
			this.DraggingDiv=null;
			event.preventDefault();
		}
	});
};
//CanvasMap/js/CMPanelSearch.js
/******************************************************************************************************************
* CMPanelSearch
*
* @module CMPanelSearch
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************

function CMPanelSearch(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelSearch requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	// Properties
	this.TheElement=null;
}

CMPanelSearch.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelSearch.prototype.contructor=CMPanelSearch; // override the constructor to go to ours
//******************************************************************
// Private Functions
//******************************************************************

//******************************************************************
// Functions
//******************************************************************

CMPanelSearch.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;

//	var SearchPanel=this.TabPanel.AddTab("Search","Search");
	
	TheElement.innerHTML="Search:";
	
	// create the div for the search rseults but don't add it yet
	
	var SearchResults = document.createElement("DIV");
	SearchResults.id="CM_SearchResults";
	
	// add the text field
	
	var TextField = document.createElement("INPUT");
	TextField.setAttribute("type", "text"); 
	TheElement.appendChild(TextField);
	
	// add the search button
	
	var SearchButton = document.createElement("INPUT");
	SearchButton.setAttribute("type", "button"); 
	SearchButton.value="Submit";
	SearchButton.className="CM_SearchButton";
	
	SearchButton.TextField=TextField;
	SearchButton.CanvasMap=this.GetParent();
	SearchButton.SearchResults=SearchResults;
	
	SearchButton.onclick=function()
	{
		var Text=this.TextField.value;
		
		Text=Text.toLowerCase();
		
		SearchResults.innerHTML="";
		this.CanvasMap.TheScene.GetSearchResults(Text,SearchResults);	
	}
	TheElement.appendChild(SearchButton);
	
	// add the results after the button
	
	TheElement.appendChild(SearchResults);
}

//CanvasMap/js/CMPanelTool.js
/******************************************************************************************************************
* CMPanelTool
*
* @module CMPanelTool
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************
function CMPanelTool(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelTool requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	// Properties
	this.Tools=[];
}

CMPanelTool.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelTool.prototype.contructor=CMPanelTool; // override the constructor to go to ours

//******************************************************************
// private Functions
//******************************************************************
/**
* @private
*/
CMPanelTool.prototype.GetToolIndexFromID=function(ToolID)
{
	var Result=-1;
	
	for (var i=0;i<this.Tools.length;i++)
	{
		if (this.Tools[i].id==ToolID) Result=i;
	}
	return(Result);
}

//******************************************************************
// Functions
//******************************************************************
CMPanelTool.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;
	
	this.Tools=[];
}

/**
* Add a tool to the panel.
* @public
* @param ToolID - ID which will be used to create the element
* @param UnselectedFilePath - file path for the image of the tool when unselected
* @param SelectedFilePath - file path for the tool icon when selected
*/
CMPanelTool.prototype.AddTool=function(ToolElement,UnselectedFilePath,SelectedFilePath,TheHandler,ToolTip,TheFunction)
{
//	var ToolElement=null;
	
	if  (this.TheElement!=null)
	{
		var ToolID;
			
		// create the tool element if is does not exist yet
		
		if (typeof(ToolElement) === 'string') // element does not exist yet, create it
		{
			var ToolID=ToolElement;
			
			ToolElement=document.createElement("DIV");
			ToolElement.id=ToolID;
			ToolElement.className="CM_Tool";
		}
		else 
		{
			ToolID=ToolElement.id;
		}
		// setup the rest of the tool properties
		
		ToolElement.style.backgroundColor="none";
		
		ToolElement.title=ToolTip;
		ToolElement.cursor='pointer';
		ToolElement.innerHTML="<img id='"+ToolID+"_Image' class='CMTool_Image' "+
		  "src='"+UnselectedFilePath+"'alt='ID Marker'>";
		
		ToolElement.Selected=false;
		ToolElement.ToolPanel=this;
		ToolElement.UnselectedFilePath=UnselectedFilePath;
		ToolElement.SelectedFilePath=SelectedFilePath;
		ToolElement.TheFunction=TheFunction;
		
		ToolElement.onclick=function()
		{
			var TheToolPanel=this.ToolPanel;
			var TheCanvasMap=TheToolPanel.GetParent(CMMainContainer);
			
			TheToolPanel.SelectTool(this.id);
			
			CMMainContainer.HidePopupWindows(); // global
			
			if (this.TheFunction!=undefined)
			{
				this.TheFunction(TheHandler);
			}
		}
		this.TheElement.appendChild(ToolElement);
		
		this.Tools.push(ToolElement);
	}
	return(ToolElement);
}
CMPanelTool.prototype.MakeToolGroup=function(ToolArray)
{
	// remove the tools
	for (var i=0;i<ToolArray.length;i++)
	{
		var ToolElement=ToolArray[i];
		
		ToolElement.parentNode.removeChild(ToolElement);
	}
	var TheTableDIV=document.createElement("DIV");
	TheTableDIV.className="CM_ToolGroup";
	
	var TheTable=document.createElement("TABLE");
	TheTableDIV.appendChild(TheTable);
	
	TheTable.style.borderSpacing="0px";
	
	// Add the tools back in
	var TheRow=TheTable.insertRow(0);
	
	var TheTableWidth=0;
	for (var i=0;i<ToolArray.length;i++)
	{
		var ToolElement=ToolArray[i];
		ToolElement.className="CM_ToolInGroup";

//		ToolElement.style.border="solid red 1px";
		
		var TheCell=TheRow.insertCell(-1);
		
		if (i!=ToolArray.length-1) TheCell.style.borderRight="thin solid #999";
		
		TheCell.appendChild(ToolElement);
		
		TheTableWidth+=28;
	}
	TheTableDIV.style.width=TheTableWidth+"px";
	
	this.TheElement.appendChild(TheTableDIV);
	
	return(TheTableDIV);
}
CMPanelTool.prototype.RemoveToolGroupElement=function(ToolGroupElement)
{
	this.TheElement.removeChild(ToolGroupElement);
}
CMPanelTool.prototype.AddToolGroupElement=function(ToolGroupElement)
{
	this.TheElement.appendChild(ToolGroupElement);
}

/**
* Removes the specified tool from the panel
* @public 
* @param ToolID - the DOM element id for the tool.
*/
CMPanelTool.prototype.RemoveTool=function(ToolID)
{
	var Index=this.GetToolIndexFromID(ToolID);
	
	if (Index!=-1) // found the tool
	{
		var ToolElement=this.Tools[Index];
		
		// remove the tool from the tool panel
		ToolElement.parentNode.removeChild(ToolElement);
		
		// remove the tool from the array
		this.Tools.splice(Index,1);
	}
}

/**
* Select a specific tool based on its ID and unselect the other tools
* @public
* @TargetToolID - the tool to select
*/
CMPanelTool.prototype.SelectTool=function(TargetToolID)
{
	for (var i=0;i<this.Tools.length;i++)
	{
		var TheElement=this.Tools[i];
		
		if (TheElement.id==TargetToolID) // foiund the tool to select
		{
			TheElement.Selected=true;
			
			var ImageElement=document.getElementById(TargetToolID+"_Image");
			ImageElement.src=TheElement.SelectedFilePath;
		}
		else // unselect the tool if selected
		{
			if (TheElement.Selected)
			{
				if (TheElement.UnselectFunction!=undefined) TheElement.UnselectFunction();
				
				TheElement.Selected=false;
				
				var ImageElement=document.getElementById(TheElement.id+"_Image");
				ImageElement.src=TheElement.UnselectedFilePath;
			}
		}
	}
}

//CanvasMap/js/CMPanelButtons.js
/******************************************************************************************************************
* CMPanelButtons
*
* @module CMPanelButtons
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructor
//******************************************************************
function CMPanelButtons(TheCanvasMap) 
{
	CMBase.call(this);

	if (TheCanvasMap==undefined) alert("Sorry, the CMPanelButtons requires a CanvasMap object on construction");
	
	this.SetParent(TheCanvasMap);
	
	// Properties
	this.Tabs=[];
	this.TabContents=[];
}

CMPanelButtons.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMPanelButtons.prototype.contructor=CMPanelButtons; // override the constructor to go to ours

//******************************************************************
// private Functions
//******************************************************************
/**
* @private
*/
CMPanelButtons.prototype.GetTabIndexFromName=function(TabName)
{
	var Result=-1;
	
	for (var i=0;i<this.Tabs.length;i++)
	{
		if (this.Tabs[i].Name==TabName) // this tab is being selected
		{
			Result=i;
		}
	}
	return(Result);
}

//******************************************************************
// Functions
//******************************************************************
/**
* Set the element that contains the tab panel
*/
CMPanelButtons.prototype.SetElement=function(TheElement)
{
	this.TheElement=TheElement;

	// add the container for the tabs at the top of the div
	
	this.TabContainer=document.createElement("DIV");
	this.TabContainer.className="CM_PanelButtons";
  
	this.TheElement.appendChild(this.TabContainer);
}

/**
* Add a tab to the tab panel.
* @public
* @param ContentID - The id for the content that will be associated with the tab.
* @param Name - The name that will appear in the tabs
* @param ToolTip - Optional tools tip that will appear when the user hovers over the tab.
* @returns - The tab content assocaited with the tab.
*/
CMPanelButtons.prototype.AddTab=function(ContentID,ImagePath,ToolTip,TabContent,MapContainer)
{
	if  (this.TheElement!=null) // tab container
	{
		// create the tab button element
		var ButtonElement=document.createElement("button");
		ButtonElement.id=ContentID+"_tab";
		
		ButtonElement.className="tablinks";
		
		if (ToolTip!=undefined) ButtonElement.title=ToolTip;
		ButtonElement.innerHTML="<img src='"+ImagePath+"'></img>";
		
		ButtonElement.Selected=false;
		ButtonElement.TabPanel=this;
		ButtonElement.ContentID=ContentID;
		
		ButtonElement.onclick=function()
		{
			this.TabPanel.SelectTab(this.ContentID);
			
			//CMMainContainer.HidePopupWindow(); // global
		}
		this.Tabs.push(ButtonElement);
		
		this.TabContainer.appendChild(ButtonElement);
		
		// setup the content container
		if (CMUtilities.IsDefined(TabContent)==false)
		{
			TabContent=document.createElement("DIV");
			TabContent.id=ContentID;
			TabContent.className="CM_ButtonContent";
		}
					
		TabContent.style.visibility="hidden";
		//TabContent.style.zIndex=999999;

		this.TabContents.push(TabContent);
		
		MapContainer.appendChild(TabContent);
	}
	return(TabContent);
}
/**
* Set the currently selected tab
* @public
* @param TheTabButton - the button object that was returned by AddTab()
*/
CMPanelButtons.prototype.SelectTab=function(ContentID)
{
	ContentID=ContentID+"_tab";
	
	for (var i=0;i<this.Tabs.length;i++)
	{
		if (this.Tabs[i].id==ContentID) // this tab is being selected
		{
			//this.TabContents[i].style.display="block";
			this.TabContents[i].style.visibility="visible";
			CMMainContainer.SetPopupWindow(this.TabContents[i]);
			this.Tabs[i].className = this.Tabs[i].className += " active";
		}
		else
		{
			//this.TabContents[i].style.display="none";
			this.TabContents[i].style.visibility="hidden";
			this.Tabs[i].className = this.Tabs[i].className.replace(" active", "");
		}
	}
}
/***
* Returns a tab content element so it can be filled
* @public
* @param TabName - name of the tab whose content will be returned
*/
CMPanelButtons.prototype.GetTabContentElement=function(TabName)
{
	var Result=null;
	
	var Index=this.GetTabIndexFromName(TabName);
	
	if (Index!=-1) Result=this.TabContents[Index];

	return(Result);
}

/***
* Removes a table from tab container
* @public
* @param TabName - name of the tab whose content will be returned
*/
CMPanelButtons.prototype.RemoveTab=function(TabName)
{
	var Index=this.GetTabIndexFromName(TabName);
	
	if (Index!=-1) // found the tool
	{
		var ButtonElement=this.Tabs[Index];
		
		// remove the tool from the tool panel
		ButtonElement.parentNode.removeChild(ButtonElement);
		
		// remove the tool from the array
		this.Tabs.splice(Index,1);
		this.TabContents.splice(Index,1);
	}
}


//CanvasMap/js/CMProjector.js
/******************************************************************************************************************
* CMProjector Base class.
* This class defines the main functions for projectors to convert between projected and
* geographic coordinates.
*
* This class also provides a projector that can be used to keep geographic data as geographic
* data.  In otherwords, it does not touch the data and assumes the data is in geographic.  This
* allows it to work with layers like the graticule layer.
*
* @module CMProjector
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constructors
//******************************************************************
/*
* Constructor for a projector.  This is a null class that just passes
* the coordinate values back without changing them.  It effectively
* implements a flattened "geographic" projection.
* @protected, @constructs
*/
function CMProjector() 
{
	CMBase.call(this);	
}

CMProjector.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMBase()

CMProjector.prototype.contructor=CMProjector; // override the constructor to go to ours

//***************************************************************************************
// Private static functions
//***************************************************************************************
/**
* Return the range of x coordinate values if it is less then the range for the y coordinate values,
* otherwise, return the y range
* @private
*/
CMProjector.GetMinPointDistance=function(Xs,Ys)
{
	var XMinMax=CMUtilities.GetMinMax(Xs);
	var YMinMax=CMUtilities.GetMinMax(Ys);

	var XFactor=(XMinMax.Max-XMinMax.Min)/200;
	var YFactor=(YMinMax.Max-YMinMax.Min)/200;

	var MinDistance=XFactor;
	if (XFactor>YFactor) MinDistance=YFactor;
	
	return(MinDistance);
}
//***************************************************************************************
// Protected Functions to be used by subclasses to project data after clipping to bounds
//***************************************************************************************

/**
* Projects a single poly (i.e. an array of arrays of coordinates - 2 deep) (lineString, linearRing)
* but without clipping.  
* @proected
*/
CMProjector.prototype.ProjectPolyFromGeographicWithoutClip=function(ThePoly)
{
	var NewPoly=[];
	
	var Xs=ThePoly[0];
	var Ys=ThePoly[1];
	
	var NewXs=[];
	var NewYs=[];
	
	for (var j=0; j < Xs.length; j++) 
	{
		try
		{
			var Coordinate=this.ProjectFromGeographic(Xs[j],Ys[j]);
			
			if (CMUtilities.IsDefined(Coordinate))
			{
				NewXs.push(Coordinate[0]);
				NewYs.push(Coordinate[1]);
			}
		}
		catch (Error)
		{
			throw(Error);
		}
	}
	return([NewXs,NewYs]);
}
/**
* Projects an array of related polys (i.e. an array of arrays of arrays - 3 deep) (multiLineString, polygon)
* @proected
*/
CMProjector.prototype.ProjectAreaFromGeographicWithoutClip=function(TheArea)
{
	var NewArea=[];
	
	for (var j=0; j < TheArea.length; j++) 
	{
		NewArea[j]=this.ProjectPolyFromGeographicWithoutClip(TheArea[j]);
	}
	return(NewArea);
}
/**
* Projects an array of related polys (i.e. an array of arrays of arrays of arrays - 4 deep) (multiPolygon)
* @proected
*/
CMProjector.prototype.ProjectRegionFromGeographicWithoutClip=function(TheRegion)
{
	var NewRegion=[];
	
	for (var j=0; j < TheRegion.length; j++) 
	{
		NewRegion[j]=this.ProjectAreaFromGeographicWithoutClip(TheRegion[j]);
	}
	return(NewRegion);
}

//******************************************************************
// CMProjector functions for subclasses to override
//******************************************************************
/**
* Subclasses should override this to setup for projecting.
* @override
* @protected
*/
CMProjector.prototype.Initialize=function()
{
}

/**
* Primary function to convert from a projected coordinate to geographic
* @override
* @public
* @param Easting - east-west projected coordinate value
* @param Northing - north-south projected coordinate value
* @param Elevation - vertical coordinate value in meters
*/
CMProjector.prototype.ProjectToGeographic=function(Easting,Northing,Elevation)
{
	var Result=[Easting,Northing,Elevation];
	
	return(Result);
}
/**
* Primary function to convert from a projected system to geographic
* @override
* @public
* @param Longitude - east-west geographic coordinate value
* @param Latitude - north-south geographic coordinate value
* @param Elevation - vertical coordinate value in meters
*/
CMProjector.prototype.ProjectFromGeographic=function(Longitude,Latitude,Elevation)
{
	var Result=[Longitude,Latitude,Elevation];
	return(Result);
}
//******************************************************************
// Protected functions for subclasses to override as needed
//******************************************************************
CMProjector.prototype.GetMethods=function()
{
	var SettingsDefinitions=this.GetSettingsDefinitions();
	var ProjectionMethods=SettingsDefinitions.Projection.Method.Options;
	return(ProjectionMethods);
}

/**
* Return the clipping polygons in geographic coordinates for the projection.
* Override to provide clipping to keep geometries correct for projections.
* No longer gets called
* @override
* @public
*/
CMProjector.prototype.GetClippingPolys=function()
{
	//alert("CMProjector.prototype.GetClippingPolys() needs to be overriden");
	
	var Left=-180;
	var Right=180;
	var Top=90;
	var Bottom=-90
	
	var ClippingPoly={
		Xs:[Left,Right,Right,Left],
		Ys:[Top,Top,Bottom,Bottom],
		Outside:[true,true,true,true]
	};
	Result=[ClippingPoly];
	
	return(Result);
}
/**
* Return a region that can be used to draw the outline of the Geo based on the current projection.
* This is based only on the "Outside" bounding areas.
* @protected
* @returns A Region that can be drawn with TheView.PaintRefRegion(RegionToDraw,false,false,true)
*/
CMProjector.prototype.GetRegionToDraw=function()
{
	var RegionToDraw=[];
	
	// fill the area
	var ClippingPolys=this.GetClippingPolys();
	
	if (ClippingPolys==null) // no clipping
	{
		var X2s=[-180,180,180,-180];
		var Y2s=[90,90,-90,-90];
		
		var NewArea=this.ProjectAreaFromGeographicWithoutClip([[X2s,Y2s]]);
		
		RegionToDraw.push(NewArea);
	}
	else
	{
		// stroke the outside areas
		for (var i=0;i<ClippingPolys.length;i++)
		{
			var ClippingPoly=ClippingPolys[i];
			
			var Xs=ClippingPoly.Xs;
			var Ys=ClippingPoly.Ys;
			var Outside=ClippingPoly.Outside;
	
			// create a series of polylines for each edge of the bounds when the Outside flag is true
			
			for (var j=0;j<Outside.length;j++)
			{
				if (Outside[j]) // line is on the outside of the bounds (top)
				{
					var NextIndex=j+1;
					if (NextIndex==Outside.length) NextIndex=0;
					
					var X1s=[Xs[j],Xs[NextIndex]];
					var Y1s=[Ys[j],Ys[NextIndex]];
					
					var NewArea=[[X1s,Y1s]];
					
					var MinDistance=CMProjector.GetMinPointDistance(Xs,Ys);
			
					NewArea=CMUtilities.AddPointsToArea(NewArea,CMDatasetVector.TYPE_POLYGONS,MinDistance); // TYPE_POLYLINES
					
					NewArea=this.ProjectAreaFromGeographicWithoutClip(NewArea);
					
					RegionToDraw.push(NewArea);
				}
			}
		}
	}
	return(RegionToDraw);
}
/**
* Return a region that can be used to fill the valid areas of a projection.  This can be different from
* the drawing bounds because it includes polygons inside the bounds.
* @protected
* @returns A Region that can be drawn with TheView.PaintRefRegion(...)
*/
CMProjector.prototype.GetRegionToFill=function()
{
	var RegionToFill=[];
	
	// fill the area
	var BBoxes=this.GetClippingPolys();
	
	if (BBoxes==null)
	{
		var X2s=[-180,180,180,-180];
		var Y2s=[90,90,-90,-90];
		
		var NewArea=this.ProjectAreaFromGeographicWithoutClip([[X2s,Y2s]]);
		
		RegionToFill.push(NewArea);
	}
	else
	{
		// fill the areas
		for (var i=0;i<BBoxes.length;i++)
		{
			var BBox=BBoxes[i];
			
			var Xs=BBox.Xs;
			var Ys=BBox.Ys;
			var Outside=BBox.Outside;
	
			// clip to each of the bounding boxes and project the resulting areas
			//var ClippedArea=CMUtilities.ClipArea(TheArea,BBoxes[i],Closed);
			
			var NewArea=[[Xs,Ys]];
			
			var MinDistance=CMProjector.GetMinPointDistance(Xs,Ys);
			
			NewArea=CMUtilities.AddPointsToArea(NewArea,CMDatasetVector.TYPE_POLYGONS,MinDistance);
			
			NewArea=this.ProjectAreaFromGeographicWithoutClip(NewArea);
			
			RegionToFill.push(NewArea);
			//TheView.PaintRefArea(NewArea,true,true,false); // area, closed, fill, no stroke
		}
	}
	return(RegionToFill);
}
/**
* Return the X/Y Min/Max projected range of values.
* @protected
* @returns - Dictionary with XMin, XMax, YMin, YMax
*/
CMProjector.prototype.GetProjectedBounds=function()
{
	var Result=null;
	
	var ClippingBoxes=this.GetClippingPolys();
	
	if (ClippingBoxes!=null)
	{
		var Initialized=false;
		var XMin=0;
		var YMin=0;
		var XMax=0;
		var YMax=0;
		
		for (var i=0;i<ClippingBoxes.length;i++)
		{
			var ClippingBox=ClippingBoxes[i];
			
			var NewArea=[[ClippingBox.Xs,ClippingBox.Ys]];
			
			NewArea=CMUtilities.AddPointsToArea(NewArea,CMDatasetVector.TYPE_POLYGONS,5);
			
			NewArea=this.ProjectAreaFromGeographicWithoutClip(NewArea);
			
			var Xs=NewArea[0][0];
			var Ys=NewArea[0][1];
			
			for (var j=0;j<Xs.length;j++)
			{
				if (Initialized==false)
				{
					XMax=Xs[j];
					XMin=Xs[j];
					YMax=Ys[j];
					YMin=Ys[j];
					
					Initialized=true;
				}
				else
				{
					if (Xs[j]<XMin) XMin=Xs[j];
					if (Xs[j]>XMax) XMax=Xs[j];
					if (Ys[j]<YMin) YMin=Ys[j];
					if (Ys[j]>YMax) YMax=Ys[j];
				}
			}
		}
		Result={
			XMin:XMin,
			XMax:XMax,
			YMin:YMin,
			YMax:YMax
		};
	}
	return(Result);
}
//******************************************************************
// Public functions to project.  These should be overriden if
// clipping is required.
//******************************************************************

/**
* Override to provide clipping to keep geometries correct for projections.
* @override
* @public
* @param ThePoly - Array of two dimensions, ThePoly[0]=Xs[] and ThePoly[1]=Ys[], optionally, ThePoly[2]=Zs[]
* @returns - An array with the new Xs, Ys, and Zs.
*/
CMProjector.prototype.ProjectPolyFromGeographic=function(ThePoly)
{
	// get the current arrays and setup the new arrays
	var Xs=ThePoly[0];
	var Ys=ThePoly[1];
	var Zs=null;
	
	var NewXs=[];
	var NewYs=[];
	var NewZs=null;
	
	if (ThePoly.length>2) 
	{
		Zs=ThePoly[2];
		NewZs=[];
	}
	// projection the coordinates
	var Z=undefined;
	for (var i=0;i<Xs.length;i++)
	{
		if (Zs!=null) Z=Zs[i];
		
		var Result=this.ProjectFromGeographic(Xs[i],Ys[i],Z);
		
		NewXs.push(Result[0]);
		NewYs.push(Result[1]);
		if (Zs!=null) NewZs.push(Result[2]);
	}
	var NewPoly=[NewXs,NewYs];
	
	return(NewPoly);
}
/**
* Projects an Area, an array of polys, to geographic.
* @override
* @public
* @param TheArea - Array of polygons (2D or 3D)
* @param TheType - CMDatasetVector.TYPE_POINTS, CMDatasetVector.TYPE_POLYLINES, or CMDatasetVector.TYPE_POLYGONS, 
* @returns - An array of new polys
*/
CMProjector.prototype.ProjectAreaFromGeographic=function(TheArea,TheType)
{
	this.Initialize();
	
	var NewArea=[];
	 
	// find the two bounding boxes
	var BBoxes=this.GetClippingPolys();
	
	if (BBoxes==null)
	{
		NewArea=this.ProjectAreaFromGeographicWithoutClip(TheArea);
	}
	else
	{
		for (var i=0;i<BBoxes.length;i++)
		{
			var ClippingBox=BBoxes[i];
			
			// clip to each of the bounding boxes and project the resulting areas
			
			// jjg - this will need to change with more complex bounds
			var TurfBBox=[ClippingBox.Xs[0],ClippingBox.Ys[2],ClippingBox.Xs[2],ClippingBox.Ys[0]]; // minX, minY, maxX, maxY
			
			var ClippedArea=CMUtilities.ClipArea(TheArea,TurfBBox,TheType);
			
			ClippedArea=CMUtilities.AddPointsToArea(ClippedArea,TheType,5);
			
			ClippedArea=this.ProjectAreaFromGeographicWithoutClip(ClippedArea);
			
			for (var j=0;j<ClippedArea.length;j++) NewArea.push(ClippedArea[j]);
		}
	}
	return(NewArea);
}
/**
* Projects a Region, an array of areas, to geographic.
* @override
* @public
* @param TheRegion - Array of Areas (2D or 3D)
* @param TheType - CMDatasetVector.TYPE_POINTS, CMDatasetVector.TYPE_POLYLINES, or CMDatasetVector.TYPE_POLYGONS, 
* @returns - An array of new Areas
*/
CMProjector.prototype.ProjectRegionFromGeographic=function(TheRegion,TheType)
{
	this.Initialize();
	
	var NewRegion=[];
	 
	for (var i=0;i<TheRegion.length;i++)
	{
		var NewArea=this.ProjectAreaFromGeographic(TheRegion[i],TheType);
		
		NewRegion.push(NewArea);
	}

	return(NewRegion);
}
/**
* Projects an array of Regions to geographic.  This is the same as the spatial data
* for a single feature.
* @override
* @public
* @param TheRegion - Array of Regions (2D or 3D)
* @param TheType - CMDatasetVector.TYPE_POINTS, CMDatasetVector.TYPE_POLYLINES, or CMDatasetVector.TYPE_POLYGONS, 
* @returns - An array of new Regions
*/
CMProjector.prototype.ProjectRegionsFromGeographic=function(TheRegions,TheType)
{
	this.Initialize();
	
	var NewRegions=[];
	 
	for (var i=0;i<TheRegions.length;i++)
	{
		var NewRegion=this.ProjectRegionFromGeographic(TheRegions[i],TheType);
		
		NewRegions.push(NewRegion);
	}

	return(NewRegions);
}
//***************************************************************************************
// Protected static functions for help with bounds.
//***************************************************************************************
/**
* creates a set of rectangular clipping bounds for the specified geographic area.
* If the XMin<-180 or the XMax>180, mulitple boxes will be created.
*
* @protected, @static
*/
CMProjector.GetGeographicClippingPolys=function(XMin,XMax,YMin,YMax,Pad)
{
	Result=[];
	
	var Top=YMax;
	var Bottom=YMin;
	
	// find the two bounding boxes
	if (XMin<-180)
	{
		if (XMax<-180) // just have one clipping box on the left
		{
			var Left=XMin+360+Pad;
			var Right=XMax+360-Pad;
			
			var ClippingBox={
				Xs:[Left,Right,Right,Left],
				Ys:[Top,Top,Bottom,Bottom],
				Outside:[true,true,true,true]
			};
			Result.push(ClippingBox);
		}
		else // XMax>-180 and is <180, have two boxes, -180/180 is shared edge
		{
			var Left=XMin+360+Pad;
			var Right=180;
			
			var ClippingBox={
				Xs:[Left,Right,Right,Left],
				Ys:[Top,Top,Bottom,Bottom],
				Outside:[true,false,true,true]
			};
			Result.push(ClippingBox);

			var Left=-180;
			var Right=XMax-Pad;
			
			var ClippingBox={
				Xs:[Left,Right,Right,Left],
				Ys:[Top,Top,Bottom,Bottom],
				Outside:[true,true,true,false]
			};
			Result.push(ClippingBox);
		}
	}
	else if (XMax>180) // XMax must be greater than 180
	{
		if (XMin>180) // both are greater than 180, one clipping box on the right
		{
			var Left=XMin-360+Pad;
			var Right=XMax-360-Pad;
			
			var ClippingBox={
				Xs:[Left,Right,Right,Left],
				Ys:[Top,Top,Bottom,Bottom],
				Outside:[true,true,true,true]
			};
			Result.push(ClippingBox);
		}
		else // XMin<180 and XMax > 180
		{
			if (true)
			{
				var Left=XMin+Pad;
				var Right=180;
				
				var ClippingBox={
					Xs:[Left,Right,Right,Left],
					Ys:[Top,Top,Bottom,Bottom],
					Outside:[true,false,true,true]
				};
				Result.push(ClippingBox);
				
				//
				var Left=-180;
				var Right=XMax-360-Pad;
				
				var ClippingBox={
					Xs:[Left,Right,Right,Left],
					Ys:[Top,Top,Bottom,Bottom],
					Outside:[true,true,true,false]
				};
				Result.push(ClippingBox);
			}
			else
			{
				//
				var Left=XMin+Pad;
				var Right=180;
				
				var ClippingBox={
					Xs:[Left,Right,Right,Left],
					Ys:[Top,Top,Bottom,Bottom],
					Outside:[true,false,true,true]
				};
				Result.push(ClippingBox);
				
				//
				var Left=-180;
				var Right=XMax-360-Pad;
				
				var ClippingBox={
					Xs:[Left,Right,Right,Left],
					Ys:[Top,Top,Bottom,Bottom],
					Outside:[true,true,true,false]
				};
				Result.push(ClippingBox);
			}
		}
	}
	else // both are within the valid range
	{
		var Left=XMin+Pad;
		var Right=XMax-Pad;
		
		var ClippingBox={
			Xs:[Left,Right,Right,Left],
			Ys:[Top,Top,Bottom,Bottom],
			Outside:[true,true,true,true]
		};
		Result.push(ClippingBox);
	}

	return(Result);
}

//***************************************************************************************
// Public static functions for Unit conversions
//***************************************************************************************
/*
* Convert an angle in degrees to radians
* @public, @static
* @param - DegreeAngle
* @returns - angle in radians
*/
CMProjector.DegreesToRadians=function(DegreeAngle)
{
	var RadianAngle=DegreeAngle*(Math.PI/180);
	
	return(RadianAngle);
}
/*
* Convert an angle in radians to degrees
* @public, @static
* @param - RadianAngle
* @returns - angle in degrees
*/
CMProjector.RadiansToDegrees=function(RadianAngle) 
{
	DegreeAngle= RadianAngle/(Math.PI/180);
	
	return(DegreeAngle);
}

//CanvasMap/js/CMProjectorGoogleMaps.js
/******************************************************************************************************************
* CMProjector class to convert between Geographic and UTM coordinates
*
* @module CMProjector
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//***************************************************************************************
//	Defintions
//***************************************************************************************

// these values are simply the number of pixels across (256, 512, 1024, etc.) divided by 360

var Mercator_PixelsPerDegreee=[0.71111111111111,1.4222222222222,2.8444444444444,5.6888888888889,11.377777777778,22.755555555556,
	45.511111111111,91.022222222222,182.04444444444,364.08888888889,728.17777777778,1456.3555555556,2912.7111111111,
	5825.4222222222,11650.844444444,23301.688888889,46603.377777778,93206.755555556,186413.51111111,372827.02222222];
var Mercator_PixelsPerRadian=[40.743665431525,81.48733086305,162.9746617261,325.9493234522,651.8986469044,1303.7972938088,
	2607.5945876176,5215.1891752352,10430.37835047,20860.756700941,41721.513401882,83443.026803764,166886.05360753,
	333772.10721505,667544.21443011,1335088.4288602,2670176.8577204,5340353.7154409,10680707.430882,21361414.861763];
	
// these values are one half the map width (offset to the center of the map) for each zoom (i.e. Zoom=0 is 256 pixels wide)

var Mercator_Offsets=[128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576,2097152,4194304, // 0-15 (1=512 x 512)
	8388608,16777216,33554432,67108864]; // 16-19 (we use 18)
	
var Mercator_NumColumns=[0,1,2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768, // 0-15 (1=512 x 512)
	65536,131072,262144,524288]; // 16-19 (we use 18)

//***************************************************************************************
// Constructor
//***************************************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMProjectorGoogleMaps() 
{
	CMProjector.call(this);

	this.ZoomLevel=18; // this matches about 1 meter at the equator
}
CMProjectorGoogleMaps.prototype=Object.create(CMProjector.prototype); // inherit prototype functions from PanelBase()

CMProjectorGoogleMaps.prototype.contructor=CMProjectorGoogleMaps; // override the constructor to go to ours
//***************************************************************************************
//	CMProjector functions
//***************************************************************************************

/*
*
*/
CMProjectorGoogleMaps.prototype.ProjectFromGeographic=function(Lon,Lat)
{
	var Offset=Mercator_Offsets[this.ZoomLevel]; // 16777216,16777216
	
	var x=Math.round(Offset+Lon*Mercator_PixelsPerDegreee[this.ZoomLevel]);
	
	var Temp=Math.sin(CMProjector.DegreesToRadians(Lat));
	
	Temp=Math.max(Temp,-0.9999); // clip to -0.9999
	Temp=Math.min(Temp,0.9999); // clip to 0.9999

	var y=Math.round(Offset+0.5*Math.log((1+Temp)/(1-Temp))*-Mercator_PixelsPerRadian[this.ZoomLevel]);
	
	var Result=[x,-y];
	
	return(Result);
};

CMProjectorGoogleMaps.prototype.ProjectToGeographic=function(X,Y)
{
	Y=-Y;
//	PanelDebugging_Append("GetGeographicFromGoogleMaps() X="+X+" Y="+Y+" this.ZoomLevel="+this.ZoomLevel);
	
	var Offset=Mercator_Offsets[this.ZoomLevel];
	
//	Y+=Offset;
//	PanelDebugging_Append("GetGeographicFromGoogleMaps() Offset="+Offset+" Y-Offset="+(Y-Offset));
	
	var Lon=(X-Offset)/Mercator_PixelsPerDegreee[this.ZoomLevel];
	
	var Temp=(Y-Offset)/-Mercator_PixelsPerRadian[this.ZoomLevel];
//	PanelDebugging_Append("GetGeographicFromGoogleMaps() Temp="+Temp);
	
	var Thing=2*Math.atan(Math.exp(Temp));
	
//	PanelDebugging_Append("GetGeographicFromGoogleMaps() Thing="+Thing);
	
	var Thing2=Thing-Math.PI/2;
	
//	PanelDebugging_Append("GetGeographicFromGoogleMaps() Thing2="+Thing2);
	
	var Lat=CMProjector.RadiansToDegrees(Thing-Math.PI/2);
//	PanelDebugging_Append("GetGeographicFromGoogleMaps() Lat="+Lat);
	
	var Result=[Lon,Lat];
	
	return(Result);
};
/**
* 
*/
CMProjectorGoogleMaps.prototype.GetClippingPolys=function()
{
	var XMin=-180;
	var XMax=180;
	var YMin=-85;
	var YMax=85;
		
	var Pad=0.001;
	Result=CMProjector.GetGeographicClippingPolys(XMin,XMax,YMin,YMax,Pad);

	return(Result);
}

//***************************************************************************************
// CMProjectorGoogleMaps Functions
//***************************************************************************************
CMProjectorGoogleMaps.prototype.SetZoomLevel=function(ZoomLevel) 
{ 
	this.ZoomLevel=ZoomLevel; 
}

//CanvasMap/js/CMProjectorUTM.js
/******************************************************************************************************************
* CMProjectorUTM
*
* @module CMProjectorUTM
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
/**
* Below are the settings definitions.
* @public, @settings
*/
CMProjectorUTM.SettingDefintions=
{
	UTM: 
	{ 
		Datum: { Name:"Datum",Type:CMBase.DATA_TYPE_ENUMERATED,Options:[CMProjector.WGS_84,CMProjector.NAD_27,CMProjector.NAD_83] }, // Datum for the projection
		Zone: { Name:"Zone",Type:CMBase.DATA_TYPE_INTEGER, Default:10 }, // The UTM Zone (could be north or south)
		South: { Name:"South",Type:CMBase.DATA_TYPE_BOOLEAN, Default:false} // true for southern hemisphere
	},
};

//******************************************************************
// Constructor
//******************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMProjectorUTM() 
{
	CMProjector.call(this);

	this.Settings=	
	{
	};
//	this.Datum=CMProjectorUTM.WGS_84;
//	this.UTMZone=10;
//	this.South=false;
}
CMProjectorUTM.prototype=Object.create(CMProjector.prototype); // inherit prototype functions from PanelBase()

CMProjectorUTM.prototype.contructor=CMProjectorUTM; // override the constructor to go to ours
//***************************************************************************************
//	Definitions
//***************************************************************************************

//var WGS_72=0; // wgs 72 ellipsoid
CMProjector.WGS_84=1; // wgs 84 ellipsoid
CMProjector.NAD_27=2; // clarke 1866 ellipsoid
CMProjector.NAD_83=3; // grs 1980 ellipsoid

CMProjectorUTM.EPSG_WGS84_UTM_1_NORTH=32601; // add to get 1 through 60
CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH=32701; // add to get 1 through 60
/*
Reference ellipsoids derived from Peter H. Dana's website- 
http://www.utexas.edu/depts/grg/gcraft/notes/datum/elist.html
Department of Geography, University of Texas at Austin
Internet: pdana@mail.utexas.edu
3/22/95

Source
Defense Mapping Agency. 1987b. DMA Technical Report: Supplement to Department of Defense World Geodetic System
1984 Technical Report. Part I and II. Washington, DC: Defense Mapping Agency
*/
CMProjectorUTM.PI=3.14159265;
//CMProjectorUTM.FOURTHPI=CMProjectorUTM.PI / 4;
CMProjectorUTM.deg2rad=CMProjectorUTM.PI / 180;
CMProjectorUTM.rad2deg=180.0 / CMProjectorUTM.PI;

// datum defitions for use with functions

CMProjectorUTM.EquatorialRadii=new Array(6378135,6378137,6378206,6378137);
CMProjectorUTM.SquaresOfEccentricity=new Array(0.006694318,0.00669438,0.006768658,0.00669438);
//***************************************************************************************
//	CMBase functions
//***************************************************************************************

CMProjectorUTM.prototype.CMProjector_GetSettingsDefinitions=CMProjector.prototype.GetSettingsDefinitions;

CMProjectorUTM.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMProjector_GetSettingsDefinitions();
	
	for (Key in CMProjectorUTM.SettingDefintions)
	{
		Result[Key]=CMProjectorUTM.SettingDefintions[Key];
	}
	return(Result); 
}


//***************************************************************************************
//	CMProjector functions
//***************************************************************************************

//
// Converts a Lat/Long pair into a UTM coordinate in a specified UTM Zone
//	Returns an array with:
//	Result[0] - Easthing (X)
//	Result[1] - Northing (Y)
//	Result[2] - South flag (true/false)
//
CMProjectorUTM.prototype.ProjectFromGeographic=function(Long,Lat)
{
	//if (this.Datum==undefined) alert("Sorry, the datum must be defined to call ProjectFromGeographic in the CMProjectorUTM class");
	
	var Easting=0;
	var Northing=0;
//	var South=false; // assume northern
	
	if (Long<-180) Long=-180;
	if (Long>180) Long=180;
	if (Lat<-90) Lat=-90;
	if (Lat>90) Lat=90;

	var Result=null;
	
//	alert("Datum="+Datum);
	
	var Datum=this.GetSetting("UTM","Datum",CMProjector.WGS_84);
	
	if ((Datum>=0)&&(Datum<4))
	{
		var a=CMProjectorUTM.EquatorialRadii[Datum];
		var eccSquared=CMProjectorUTM.SquaresOfEccentricity[Datum];
		var k0=0.9996;

		var eccPrimeSquared;
		var N, T, C, A, M;

		var LongOrigin;
		var LongOriginRad;

		var LongTemp=(Long+180)-parseInt(((Long+180)/360)*360-180); // -180.00 .. 179.9;
		var LatRad=Lat*CMProjectorUTM.deg2rad;
		var LongRad=Long*CMProjectorUTM.deg2rad;
		
		var UTMZone=this.GetSetting("UTM","Zone",10);
		
		LongOrigin=(UTMZone - 1)*6 - 180 + 3;  //+3 puts origin in middle of zone
		LongOriginRad=LongOrigin * CMProjectorUTM.deg2rad;

		// compute the UTM Northing and Easting

		eccPrimeSquared=(eccSquared)/(1-eccSquared);

		N=a/Math.sqrt(1-eccSquared*Math.sin(LatRad)*Math.sin(LatRad));
		T=Math.tan(LatRad)*Math.tan(LatRad);
		C=eccPrimeSquared*Math.cos(LatRad)*Math.cos(LatRad);
		A=Math.cos(LatRad)*(LongRad-LongOriginRad);

		M=a*((1	- eccSquared/4		- 3*eccSquared*eccSquared/64	- 5*eccSquared*eccSquared*eccSquared/256)*LatRad 
					- (3*eccSquared/8	+ 3*eccSquared*eccSquared/32	+ 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(2*LatRad)
										+ (15*eccSquared*eccSquared/256 + 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(4*LatRad) 
										- (35*eccSquared*eccSquared*eccSquared/3072)*Math.sin(6*LatRad));
		
		Easting=(k0*N*(A+(1-T+C)*A*A*A/6
						+ (5-18*T+T*T+72*C-58*eccPrimeSquared)*A*A*A*A*A/120)
						+ 500000.0);

		Northing=(k0*(M+N*Math.tan(LatRad)*(A*A/2+(5-T+9*C+4*C*C)*A*A*A*A/24
					+ (61-58*T+T*T+600*C-330*eccPrimeSquared)*A*A*A*A*A*A/720)));

		var South=this.GetSetting("UTM","South",false);
		
		if (South)//(Lat < 0)
		{
			Northing += 10000000.0; //10000000 meter offset for southern hemisphere
		}

//		alert("Easting="+Easting+" Northing="+Northing);
		
		Result=[Easting,Northing];
	}
	return(Result);
}
/*
* 
*/
CMProjectorUTM.prototype.ProjectToGeographic=function(Easting,Northing)
{
	var		Lat
	var		Long;
	var		k0=0.9996;
	var		a=1;
	var		eccSquared=0;
	var		eccPrimeSquared;
	var		e1=0;
	var		N1, T1, C1, R1, D, M;
	var		LongOrigin;
	var		mu, phi1, phi1Rad;
	var		x, y;

	var Datum=this.GetSetting("UTM","Datum",CMProjector.WGS_84);
	
	if (Datum==undefined) alert("Sorry, the datum must be defined to call ProjectToGeographic in the CMProjectorUTM class");
	
	var Result=null;
	
	if ((Datum>=0)&&(Datum<4)&&(Easting>-4000000)&&(Easting<4500000))
	{
		a=CMProjectorUTM.EquatorialRadii[Datum];
		eccSquared=CMProjectorUTM.SquaresOfEccentricity[Datum];
		e1=(1-Math.sqrt(1-eccSquared))/(1+Math.sqrt(1-eccSquared));

		x=Easting - 500000.0; // remove 500,000 meter offset for longitude
		y=Northing;

		var South=this.GetSetting("UTM","South",false);
		
		if (South==true) y -= 10000000.0;//remove 10,000,000 meter offset used for southern hemisphere

		var UTMZone=this.GetSetting("UTM","Zone",10);
		
		LongOrigin=(UTMZone - 1)*6 - 180 + 3;  //+3 puts origin in middle of zone

		eccPrimeSquared=(eccSquared)/(1-eccSquared);

		// do the ugly math

		M=y / k0;
		mu=M/(a*(1-eccSquared/4-3*eccSquared*eccSquared/64-5*eccSquared*eccSquared*eccSquared/256));

		phi1Rad=mu	+ (3*e1/2-27*e1*e1*e1/32)*Math.sin(2*mu) 
					+ (21*e1*e1/16-55*e1*e1*e1*e1/32)*Math.sin(4*mu)
					+(151*e1*e1*e1/96)*Math.sin(6*mu);
		phi1=phi1Rad*CMProjectorUTM.rad2deg;

		N1=a/Math.sqrt(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad));
		T1=Math.tan(phi1Rad)*Math.tan(phi1Rad);
		C1=eccPrimeSquared*Math.cos(phi1Rad)*Math.cos(phi1Rad);
		R1=a*(1-eccSquared)/Math.pow(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad), 1.5);
		D=x/(N1*k0);

		Lat=phi1Rad - (N1*Math.tan(phi1Rad)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*eccPrimeSquared)*D*D*D*D/24
						+(61+90*T1+298*C1+45*T1*T1-252*eccPrimeSquared-3*C1*C1)*D*D*D*D*D*D/720);

		Lat=Lat * CMProjectorUTM.rad2deg;

		Long=(D-(1+2*T1+C1)*D*D*D/6+(5-2*C1+28*T1-3*C1*C1+8*eccPrimeSquared+24*T1*T1)
						*D*D*D*D*D/120)/Math.cos(phi1Rad);

		Long=LongOrigin + Long * CMProjectorUTM.rad2deg;

		if (Long<-180) Long=-180;
		if (Long>180) Long=180;
		if (Lat<-90) Lat=-90;
		if (Lat>90) Lat=90;

	
		Result=[Long,Lat];
	}
	return(Result);
}
/**
*
*/
CMProjectorUTM.prototype.GetBounds2=function()
{
	var UTMZone=this.GetSetting("UTM","Zone",10);
		
	var LongOrigin=(UTMZone - 1)*6 - 180 + 3;  //+3 puts origin in middle of zone
	
	var Bounds={
		XMax:LongOrigin+30, // at below 75 (50 from center of zone) the reverse transform starts to fail.
		XMin:LongOrigin-30, // center is 120
		YMax:80,
		YMin:-80
	};
	return(Bounds);
}


CMProjectorUTM.prototype.GetClippingPolys=function()
{
	var Result=null;
	
	var TheBounds=this.GetBounds2();
	
	var XMin=TheBounds.XMin;
	var XMax=TheBounds.XMax;
	var YMin=TheBounds.YMin;
	var YMax=TheBounds.YMax;
		
	var Pad=0.001;
	Result=CMProjector.GetGeographicClippingPolys(XMin,XMax,YMin,YMax,Pad);

	return(Result);
}
//***************************************************************************************
//	Functions to find UTM Zones and "South" value from geographic coordinates
//***************************************************************************************

CMProjectorUTM.prototype.GetUTMZoneFromLonLat=function(Long,Lat)
{
	var UTMZone=0;

	// Make sure the longitude is between -180.00 .. 179.9

//  	alert("Long="+Long);
	LongTemp=(Long+180)-parseInt((Long+180)/360)*360-180; // -180.00 .. 179.9;
 // 	alert("LongTemp="+LongTemp);

	// find the correct zone number

	UTMZone=parseInt(((LongTemp + 180)/6)) + 1;
//  	alert("UTMZone="+UTMZone);
  	
	if( Lat >= 56.0 && Lat < 64.0 && LongTemp >= 3.0 && LongTemp < 12.0 )
		UTMZone=32;

	// Special zones for Svalbard

	if( Lat >= 72.0 && Lat < 84.0 ) 
	{
		  if ( LongTemp >= 0.0  && LongTemp <  9.0 ) UTMZone=31;
		  else if ( LongTemp >= 9.0  && LongTemp < 21.0 ) UTMZone=33;
		  else if ( LongTemp >= 21.0 && LongTemp < 33.0 ) UTMZone=35;
		  else if ( LongTemp >= 33.0 && LongTemp < 42.0 ) UTMZone=37;
	}
	return(UTMZone);
}

CMProjectorUTM.prototype.GetSouthFromLat=function(Latitude)
{
	var South=false;
	
	if (Latitude<0) South=true;
	
	return(South);
}

//***************************************************************************************
//	Functions to switch between UTMZones and EPSG Numbers
//***************************************************************************************

CMProjectorUTM.prototype.GetUTMZoneFromEPSG=function(EPSGNumber)
{
	var UTMZone=0;
	
	if ((EPSGNumber>=CMProjectorUTM.EPSG_WGS84_UTM_1_NORTH)&&(EPSGNumber<=CMProjectorUTM.EPSG_WGS84_UTM_1_NORTH+59))
	{
		UTMZone=EPSGNumber-CMProjectorUTM.EPSG_WGS84_UTM_1_NORTH+1;
	}
	else if ((EPSGNumber>=CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH)&&(EPSGNumber<=CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH+59))
	{
		UTMZone=EPSGNumber-CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH+1;
	}
	return(UTMZone);
}

CMProjectorUTM.prototype.GetSouthFromEPSG=function(EPSGNumber)
{
	var South=false;
	
	if ((EPSGNumber>=CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH)&&(EPSGNumber<=CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH+59))
	{
		South=true;
	}
	return(South);
}

CMProjectorUTM.prototype.GetEPSGFromUTM=function(UTMZone,South)
{
	var EPSGNumber=0;
	
	if (South==false) // northern hemisphere
	{
		EPSGNumber=CMProjectorUTM.EPSG_WGS84_UTM_1_NORTH+UTMZone-1;
	}
	else // southern hemisphere
	{
		EPSGNumber=CMProjectorUTM.EPSG_WGS84_UTM_1_SOUTH+UTMZone-1;
	}
	
	return(EPSGNumber);
}

//CanvasMap/js/CMScaleBar.js
/**
* CMScaleBar
* Class to render a scale bar into the scene.  The scale bar will be automatically 
* repainted with the scale based on its position in the scene.  
* The algorithm is to find the two points at either end of the rectangle provided
* for the scale bar and convert these points to geographic coordinates.  Then,
* a great arc calculation is performed to find the distance between the points.
* The scale displayed is then found by reducing this distance to an even multiple
* of 1, 2, or 5.  If this distance does not fit in the area provided (including  the
* the labels), the next smaller distance is computed.  This continues until a distance
* is found that fits.
* 	
* Note that the scale bar is placed into a DIV in the map container.  Thus is uses aLinkcolor
* CSS style (CM_ScaleBar) for the style of the containing box.
*
* @module CMScaleBar
* @Copyright HSU, Jim Graham, 2019
*/

//***************************************************************************************
// Constructors
//***************************************************************************************
/**
* Definitions for the units.  For ISO kilomters or meters will be displayed based on the
* size of the scale bar.  For English, miles and feet are displaed.
* @enum
*/
CMScaleBar.UNITS_ISO=0; // meters, kilometers
CMScaleBar.UNITS_ENGLISH=1; // feet, miles


/**
* Below are the settings definitions.
* @public, @settings
*/
CMScaleBar.SettingDefintions=
{
	ScaleBar:
	{
		ClassName: { Name:"Class Name",Type:CMBase.DATA_TYPE_STRING, Default:"CM_ScaleBar" },
		
		// standard HTML 5 settings except the defaults may change and sometimes the available settings will change between each settings group
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		lineWidth: { Name:"Line Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		shadowColor: { Name:"Shadow Color",Type:CMBase.DATA_TYPE_COLOR, Default:"rgb(0,0,0)" },
		shadowBlur: { Name:"Shadow Blur",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetX: { Name:"Shadow X",Type:CMBase.DATA_TYPE_FLOAT, Default:1 },
		shadowOffsetY: { Name:"Shadow Y",Type:CMBase.DATA_TYPE_FLOAT, Default:1 }
	},
	UnitText:
	{
		Text: { Name:"Text",Type:CMBase.DATA_TYPE_STRING, Default:null },
		font: { Name:"Font",Type:CMBase.DATA_TYPE_FONT, Default:"12px Arial" },
		strokeStyle: { Name:"Line Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(0,0,0)" },
		fillStyle: { Name:"Fill Style",Type:CMBase.DATA_TYPE_CSS_STYLE, Default:"rgb(255,255,255)" },
		lineWidth: { Name:"Width",Type:CMBase.DATA_TYPE_INTEGER, Default:1 },
		lineCap: { Name:"Line Cap",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['butt','round','square'],Default:'round' },
		lineJoin: { Name:"Line Join",Type:CMBase.DATA_TYPE_ENUMERATED, Options:['bevel','round','miter'],Default:'round' }
	},
	Factors:
	{
		UnitFontHeightFactor: { Name:"Corner Width",Type:CMBase.DATA_TYPE_FLOAT, Default:0.35 }, // proportion of the height of the scale bar used for units
		LabelFontHeightFactor: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:0.3 },
		ScaleBarHeightFactor: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:0.3 },
		ScaleBarBaseLineFromBottomFactor: { Name:"Corner Height",Type:CMBase.DATA_TYPE_FLOAT, Default:0.2 }, // proportional distance of the bottom of the scale bar from the bottom of the background
		
		Units: { Name:"Units",Type:CMBase.DATA_TYPE_ENUMERATED, Options:[CMScaleBar.UNITS_ISO,CMScaleBar.UNITS_ENGLISH],Default:CMScaleBar.UNITS_ISO },
		Margin: { Name:"Margin",Type:CMBase.DATA_TYPE_FLOAT, Default:4 }, // margin around the scale bar
	}
};
	

/**
* Creates a new scale bar with the specified dimensions in the map.
* @public, @constructs
*/
function CMScaleBar(X,Y,Width,Height) 
{
	CMItem.call(this);
	
/*	this.TimeSlices[0].Settings.Rectangle=	
	{
		Coordinates:
		{
			Xs:[0,10], // min,max
			Ys:[0,10] // Min,max
		}
	};
	this.TimeSlices[0].Settings.RoundedRectangle=
	{
		RoundedCornerWidth:3,
		RoundedCornerHeight:3
	};
*/	this.TimeSlices[0].Settings.UnitText=
	{
	};
	this.TimeSlices[0].Settings.ScaleBar=
	{
	};
	this.TimeSlices[0].Settings.Factors=
	{
		UnitFontHeightFactor:0.35,
		LabelFontHeightFactor:0.3,
		ScaleBarHeightFactor:0.3,
		ScaleBarBaseLineFromBottomFactor:0.2,
		
		Units:CMScaleBar.UNITS_ISO,
		Margin:4,
	};
	
//	this.BottomSticky=null; // MoveFlag=null; // null for not sticky, true for move, false for size
//	this.RightSticky=null;
};

CMScaleBar.prototype=Object.create(CMItem.prototype); // inherit prototype functions from CMBase()

CMScaleBar.prototype.contructor=CMScaleBar; // override the constructor to go to ours

//***************************************************************************************
// private funtions
//***************************************************************************************
/**
* Strips the "px" from a style value (i.e. converts "100px" to "100")
*/
CMScaleBar.RemovePixels=function(Style)
{
	var Result="";
	
	if (Style!=null)
	{
		var Tokens=Style.split(" ");
		for (var i=0;i<Tokens.length;i++)
		{
			if (Tokens[i].indexOf("px")==-1) 
			{
				if (Result!="") Result+=" ";
				Result+=Tokens[i];
			}
		}
	}
	return(Result);
}

//***************************************************************************************
// Unit conversions
//***************************************************************************************

CMScaleBar.prototype.SetupScaleBar=function()
{
	if (this.TheContainer==undefined)
	{
		var TheMainContainer=this.GetParent(CMMainContainer);
		var TheCanvasContainer=TheMainContainer.GetElement(CMMainContainer.CANVAS_CONTAINER);
		
		// add the DIV container
		var TheContainer=document.createElement("div");
		TheContainer.className=this.GetSetting("ScaleBar","ClassName","CM_ScaleBar");
		
		var Width=TheContainer.offsetWidth;
		
		TheCanvasContainer.appendChild(TheContainer);
		
		this.TheContainer=TheContainer;

		// add the canvas to the container
		this.TheCanvas=document.createElement('CANVAS');
		TheContainer.appendChild(this.TheCanvas);
		
		// setup the scalebar's view with the canvas element
		this.TheView=new CMView2D();
		this.TheView.Setup(this.TheCanvas);
	}
}

//******************************************************************
// Item functions for subclasses to override
//******************************************************************
// jjg - move to util?
CMLog10 = Math.log10 || function(x) {
  return Math.log(x) * Math.LOG10E;
};

CMScaleBar.prototype.Paint=function(TheMapView)
{
	this.SetupScaleBar();
	
	var TheScene=this.GetParent(CMScene);
	
	var TheView=TheScene.GetView(0);
	
	TheView=this.TheView;
	//****************************************************************
	// Find the distance across the scale bar
	
	// convert the pixel coordinates to reference (map) coordinates)
	
	var PixelWidth=this.TheContainer.offsetWidth;
	var PixelHeight=this.TheContainer.offsetHeight;
	
	if (this.TheCanvas.width!=PixelWidth) this.TheCanvas.width=PixelWidth;
	if (this.TheCanvas.height!=PixelHeight) this.TheCanvas.height=PixelHeight;
		
	var MapPixelLeft=this.TheContainer.offsetLeft;
	var MapPixelRight=MapPixelLeft+PixelWidth;
	
	var MiddlePixelY=this.TheContainer.offsetTop+(PixelHeight/2);
	
	// get the map ref coordinate for the left and right sides of the scale bar
	var Lon1=TheMapView.GetRefXFromPixelX(MapPixelLeft);
	var Lat1=TheMapView.GetRefYFromPixelY(MiddlePixelY);
	
	var Lon2=TheMapView.GetRefXFromPixelX(MapPixelRight);
	var Lat2=Lat1; // latitudes are the same
	
	// convert the map coordinates to geographic coordinates
	
	var TheProjector=this.GetParent(CMMainContainer).GetProjector();
	
	if (TheProjector!=null)
	{
		var Result1=TheProjector.ProjectToGeographic(Lon1,Lat1);
		
		var Result2=TheProjector.ProjectToGeographic(Lon2,Lat2);
		
		if ((Result1!=null)&&(Result2!=null))
		{
			Lon1=Result1[0];
			Lat1=Result1[1];
			Lon2=Result2[0];
			Lat2=Result2[1];
		}
	}
	// convert the coordinates to radians
	
	Lon1=Lon1/180*Math.PI;
	Lat1=Lat1/180*Math.PI;
	Lon2=Lon2/180*Math.PI;
	Lat2=Lat2/180*Math.PI;
	
	// get the unit setting
	
	var FactorSettings=this.GetSettingGroup("Factors");
	
	var Units=FactorSettings["Units"];
	
	// find the create arc length
	
	var DeltaAngle=Math.acos(Math.sin(Lat1)*Math.sin(Lat2)+Math.cos(Lat1)*Math.cos(Lat2)*Math.cos(Math.abs(Lon2-Lon1)));
	
	var Distance=DeltaAngle*6371;// distance across entire scale bar area in km
	
	if (Units==CMScaleBar.UNITS_ENGLISH) Distance*=0.621371;
	
	//****************************************************************************
	// find the distance to use for the scale bar
	
	var UnitFontHeightFactor=FactorSettings["UnitFontHeightFactor"];
	var LabelFontHeightFactor=FactorSettings["LabelFontHeightFactor"];
	var ScaleBarHeightFactor=FactorSettings["ScaleBarHeightFactor"];
	var ScaleBarBaseLineFromBottomFactor=FactorSettings["ScaleBarBaseLineFromBottomFactor"];
	
	var Margin=FactorSettings["Margin"];

	// Find the width of a zero (for the left side)
	
	var TheLabelFontSetting=this.GetSetting("Text","font","12px Arial");
	
	TheLabelFontSetting=CMScaleBar.RemovePixels(TheLabelFontSetting);
	
	var LabelFontSize=""+(PixelHeight*LabelFontHeightFactor);
	var TheLabelFont=LabelFontSize+"px "+TheLabelFontSetting;
	
	// get the size of a character from the view
	
	var TheContext=TheView.TheContext;
	
	TheContext.font=TheLabelFont;
	
	var ZeroText=""+0;
	var ZeroWidth=TheContext.measureText(ZeroText).width;
	 
	// find the available width
	
	var AvailablePixels=PixelWidth-(ZeroWidth/2)-(Margin*2);
	
	// compute the Reference distance for each pixel (important) and 
	// the ScaleBarWidthInRefUnits that fits in the available width
	
	var RefDistancePerPixel=Distance/PixelWidth;
	
	var ScaleBarWidthInRefUnits=RefDistancePerPixel*AvailablePixels;
	
	// find the starting full bar width that is a mulitple of 10
	// this may be over 1 (10,000, 1000, 100, 10) or under 1 (0.1, 0.001)
	
	var N=CMLog10(ScaleBarWidthInRefUnits);
	N=Math.ceil(N);
	
	ScaleBarWidthInRefUnits=Math.pow(10,N);
	
	// draw the scale bar
	
	var Interval=1;
	var NumDigits=N+1;
	
	// find the initial width for the unit string
	
	var UnitString="km";
	if (Units==CMScaleBar.UNITS_ENGLISH) UnitString="miles";
	
	var TheUnitFontSetting=this.GetSetting("UnitText","font","12px Arial");
	
	TheUnitFontSetting=CMScaleBar.RemovePixels(TheUnitFontSetting);
	
	var UnitFontSize=""+(PixelHeight*UnitFontHeightFactor);
	var TheUnitFont=UnitFontSize+"px "+TheUnitFontSetting;
	
	TheContext.font=TheUnitFont;
	
//	var TheTextStyle=this.GetStyle(TheView,0,"Text"); // for the values along the ticks
	
	// find the initial unit width
//	TheView.SetStyle(TheUnitStyle);
	
	var UnitWidth=TheContext.measureText(UnitString).width;
	
	// reduce until it fits
	
	var ScaleBarWidthInPixels;
	
	var Fits=false;
	var Count=0;
	while ((Fits==false)&&(Count<100))
	{
		// see if we need to convert to meters
		
		if ((ScaleBarWidthInRefUnits<1)&&((UnitString=="km")||(UnitString=="miles"))) // 0.5
		{
			if (UnitString=="km")
			{
				ScaleBarWidthInRefUnits*=1000; // 500 meters
				UnitString="m";
				RefDistancePerPixel=RefDistancePerPixel*1000;
			}
			else
			{
				ScaleBarWidthInRefUnits*=10000; // 2640 feet in 1/2 mile
				UnitString="ft";
				RefDistancePerPixel=RefDistancePerPixel*5280;
			}
			// unit width changed
			
			TheContext.font=TheUnitFont;
			var UnitWidth=TheContext.measureText(UnitString).width;
//			TheContext.font=LabelFontStyle; // put the label font style back
		}
		// find the width of the last label
		
		var LabelText=""+ScaleBarWidthInRefUnits;
		
		TheContext.font=TheLabelFont;
		var LabelWidth=TheContext.measureText(LabelText).width;
		
		// find the width of the scale bar
		
		ScaleBarWidthInPixels=ScaleBarWidthInRefUnits/RefDistancePerPixel;
		
		// find the full width either by 1/2 the label width or the unit width, whichever is larger
		
		var FullWidth=ScaleBarWidthInPixels;
		
		if ((LabelWidth/2)>UnitWidth) FullWidth+=(LabelWidth/2);
		else FullWidth+=UnitWidth;
		
		// if the full width of the proposed scale bar fits, we're done
		
		if (FullWidth<AvailablePixels)
		{
			Fits=true;
		}
		else if (((UnitString=="m")||(UnitString=="ft"))&&(ScaleBarWidthInRefUnits<=0.01))
		{
			Fits=true;
		}
		else // reduce the interval 
		{
			if (Interval==1) // must be 1 going to 5 and down a digit
			{
				Interval=5;
				ScaleBarWidthInRefUnits=ScaleBarWidthInRefUnits/2;
			}
			else if (Interval==5)
			{
				Interval=2;
				ScaleBarWidthInRefUnits=ScaleBarWidthInRefUnits*2/5;
			}
			else // must be 2, going to 1
			{
				Interval=1;
				ScaleBarWidthInRefUnits=ScaleBarWidthInRefUnits/2;
			}
		}
		Count+=1;
	}
	
	//*********************************************************************
	// Draw the scale bar
	
	//this.CMItemRect_Paint(TheView);
	
	// setup the coordinates for the bar
	
	var ScaleBarWidthInPixels=ScaleBarWidthInRefUnits/RefDistancePerPixel;
	
	var ScaleBarLeft=Margin+(ZeroWidth/2);
	var ScaleBarRight=ScaleBarLeft+ScaleBarWidthInPixels;
	var ScaleBarY=PixelHeight-(PixelHeight*ScaleBarBaseLineFromBottomFactor);
	
	// get the settings
	
	var TheStyleSettings=this.GetStyle(TheView,0,"Style");
	var TheLabelSettings=this.GetStyle(TheView,0,"Text");
	var TheUnitTextSettings=this.GetStyle(TheView,0,"UnitText");
	var TheScaleBarSettings=this.GetStyle(TheView,0,"ScaleBar");
	
	// draw the backgorund
	
//	TheView.SetStyle(TheStyleSettings);
	
	TheContext.clearRect(0, 0, this.TheCanvas.width, this.TheCanvas.height);
/*	var RoundedCornerWidth=this.GetSetting("RoundedRectangle","RoundedCornerWidth");
	var RoundedCornerHeight=this.GetSetting("RoundedRectangle","RoundedCornerHeight");
	
	TheView.SetStyle(TheStyleSettings);
	
	TheView.PaintRoundedRect(MapPixelLeft,MapPixelRight,MinY,MinY+PixelHeight,RoundedCornerWidth,RoundedCornerHeight);
*/	
	TheView.RestoreStyle();
	
	// draw the units
	
	TheView.SetStyle(TheUnitTextSettings);
	
	TheContext.font=TheUnitFont;
	TheContext.fillText(UnitString,ScaleBarLeft+ScaleBarWidthInPixels+Margin,ScaleBarY);
	
	TheView.RestoreStyle();
	
	// draw the bar
	
	TheView.SetStyle(TheScaleBarSettings);
	
	TheContext.beginPath();
	TheContext.moveTo(ScaleBarLeft,ScaleBarY);
	TheContext.lineTo(ScaleBarRight,ScaleBarY);
	TheContext.stroke();
	
	// draw the ticks
	
	var ScaleBarHeight=PixelHeight*ScaleBarHeightFactor;
	
	TheContext.beginPath();
	TheContext.moveTo(ScaleBarLeft,ScaleBarY);
	TheContext.lineTo(ScaleBarLeft,ScaleBarY-ScaleBarHeight);
	TheContext.stroke();
	
	TheContext.beginPath();
	TheContext.moveTo(ScaleBarRight,ScaleBarY);
	TheContext.lineTo(ScaleBarRight,ScaleBarY-ScaleBarHeight);
	TheContext.stroke();
	
	TheView.RestoreStyle();
	
	// write out the labels
	
	TheView.SetStyle(TheLabelSettings);
	
	TheContext.font=TheLabelFont;
	
	var LabelBaseLine=ScaleBarY-ScaleBarHeight-Margin;
	
	TheContext.fillText("0",ScaleBarLeft-(ZeroWidth/2),LabelBaseLine);
	 
	var LabelText=""+ScaleBarWidthInRefUnits;
	var LabelWidth=TheContext.measureText(LabelText).width;
	 
	TheContext.fillText(LabelText,ScaleBarRight-LabelWidth/2,LabelBaseLine);
	
	TheView.RestoreStyle();
}


//CanvasMap/js/CMGeo.js
/******************************************************************************************************************
* CMGeo
* Contains a list of layers and a list of background layers.
* Also has a background style that will be drawn if set.
*
* @module CMGeo
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Global definitions
//******************************************************************

CMGeo.NumGeos=0;

//CMGeo.PROJECTOR_NONE=0; // no projection
//CMGeo.PROJECTOR_COORDINATES=1; // data is already projected, just use projector to find geographic coordinates
//CMGeo.PROJECTOR_LOAD=1; // project data from geographic to projected system on load
CMGeo.PROJECTOR_DYNAMIC=2; // projection can change at any time and projection chnaged messages should be sent

//******************************************************************
// CMScene Class
//******************************************************************
/*
* Constructor
* @public, @constructs
*/
function CMGeo(TheScene) 
{
	CMItem.call(this);

	this.SetSetting("Item","Name","Geo_"+CMGeo.NumGeos);
	CMGeo.NumGeos++;
	
	this.SetParent(TheScene);
	
	// contained objects
 	this.Layers=[]; // this is the Geo's children (jjg - move to children)
	
	this.Backgrounds=[]; // (jjg - move to children)
	this.SelectedBackgroundIndex=-1;
	
	this.TheProjector=null;
	this.ProjectorType; // undefined for default
	
	this.MinTime=0; 
	
	this.SetSetting("Style","fillStyle","rgb(210,220,255)"); // only works if there is a projection
	
	// private properties
	this.Times=[0];
	
	this.TheBounds=null;

	this.NumRepaintBlocks=0;
	this.NeedRepaint=false;
}

CMGeo.prototype=Object.create(CMItem.prototype); // inherit prototype functions from PanelBase()

CMGeo.prototype.contructor=CMGeo; // override the constructor to go to ours

//******************************************************************
// CMBase Functions
//******************************************************************

CMGeo.prototype.GetTimes=function(TheTimeSlices) 
{
	return(this.Times);
}
//

CMGeo.prototype.GetNumChildren=function(TheClass)  
{ 
	var Result=0;

	if (this.Layers!=undefined) Result=this.Layers.length;
	
	return(Result);
}

CMGeo.prototype.GetChild=function(Index,TheClass)  
{ 
	return(this.Layers[Index]);
}
/*
* Geos send event messages to their layers in the opposite of the order they are added.
*/
CMGeo.prototype.SendMessageToDescendants=function(Message,AdditionalInfo)  
{ 
	var Used=false;
	
	var NumChildren=this.GetNumChildren();
	
	for (var i=NumChildren-1;(i>=0)&&(Used==false);i--)
	{
		var TheChild=this.GetChild(i);
		
		Used=TheChild.SendMessageToDescendants(Message,AdditionalInfo);
	}
	return(Used);
}


//******************************************************************
// CMItem Functions
//******************************************************************

/**
* Unselect all information in the layers
* @public
*/
CMGeo.prototype.CMItem_UnselectAll=CMItem.prototype.UnselectAll;

CMGeo.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMItem_UnselectAll(SendMessageFlag);
	
	var NumLayers=this.GetNumChildren(CMLayer);
	
	for (var i=0;i<NumLayers;i++)
	{
		var TheChild=this.GetChild(i);
		
		TheChild.UnselectAll(SendMessageFlag);
	}
}
CMGeo.prototype.FillPopupMenu=function(ThePopupMenu)
{
	CMItem.PopupAddDelete(ThePopupMenu,this);
	
	CMItem.PopupMenuAddItem(ThePopupMenu,"Add Graticule Layer",this,"CMLayerGraticule");
	
	CMItem.PopupMenuAddItem(ThePopupMenu,"Add Dataset Layer",this,"CMLayerDataset");
	
	CMItem.PopupMenuAddItem(ThePopupMenu,"Add Item Layer",this,"CMLayerItems");
	
	CMItem.PopupMenuAddItem(ThePopupMenu,"Add Raster Layer",this,"CMLayerRaster");
}

//******************************************************************
// Search
//******************************************************************
/**
* Get the search results from each layer.  The layers will insert 
* elements into the SearchResults element
*
* Called by CanvasMap
* @private
*/
CMGeo.prototype.GetSearchResults=function(TheText,SearchResults) 
{
	var NumLayers=this.GetNumChildren(CMLayer);
	
	for (var i=0;i<NumLayers;i++)
	{
		var TheLayer=this.GetChild(i,CMLayer);
		
		TheLayer.GetSearchResults(TheText,SearchResults);
	}
}

//******************************************************************
// Projection
//******************************************************************
/**
* Inform the layers that the projection hs changed (jjg - message?)
*
* Called by CanvasMap
* @protected
*/
CMGeo.prototype.ProjectionChanged=function() 
{
	var NumLayers=this.GetNumChildren(CMLayer);
	
	for (var i=0;i<NumLayers;i++)
	{
		var TheLayer=this.GetChild(i,CMLayer);
		
		TheLayer.ProjectionChanged();
	}
}

//******************************************************************
// Event handlers
//******************************************************************
/*
* Not used
*/
CMGeo.prototype.In=function(TheView,RefX,RefY,TheEvent) 
{
	var Result=null;
	
	// in operates the opposite direction as painting
	
	var NumLayers=this.GetNumChildren(CMLayer);
	
	for (var i=NumLayers-1;(i>=0)&&(Result==null);i--)
	{
		var TheLayer=this.GetChild(i);
		
		var FeatureIndex=TheLayer.In(TheView,RefX,RefY,TheEvent);
		
		if (FeatureIndex!=-1)
		{
			Result=
			{
				LayerIndex: i,
				FeatureIndex: FeatureIndex
			}
		}
	}
	return(Result);
};

//******************************************************************
// Painting
//******************************************************************
/**
* Called when the window is resized
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMGeo.prototype.Resize=function(TheView) 
{
	var NumLayers=this.GetNumChildren(CMLayer);
	
	for (var i=0;i<NumLayers;i++)
	{
		var TheLayer=this.GetChild(i);
		
		TheLayer.Resize(TheView);
	}
	this.Repaint();
}
/**
* Paint the layers into the view
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMGeo.prototype.Paint=function(TheView) 
{
//	if (this.NumRepaintBlocks==0)
	{
		// clear the background
		if ((typeof(CM3View)=="undefined")||((TheView instanceof CM3View)==false))
		{
			var Style=this.GetStyle(TheView,0,"Style");
			
			if (Style!=undefined)
			{
				TheView.SetStyle(Style);
				
				if (this.TheProjector!=null)
				{
					var RegionToFill=this.TheProjector.GetRegionToFill();
					var RegionToDraw=this.TheProjector.GetRegionToDraw();
					
					TheView.PaintRefRegion(RegionToFill,false,true,false); // area, closed, fill, no stroke
					TheView.PaintRefRegion(RegionToDraw,false,false,true); // area, closed, no fill, stroke
				}
				TheView.RestoreStyle();
			}
		}
		// draw the backgrounds first
		
		if (this.SelectedBackgroundIndex!=-1)
		{
			this.Backgrounds[this.SelectedBackgroundIndex].Paint(TheView);
		}
	
		// then the other layers
		
		var NumLayers=this.GetNumChildren(CMLayer);
	
		for (var i=0;i<NumLayers;i++)
		{
			var TheLayer=this.GetChild(i);
		
			TheLayer.Paint(TheView);
		}
		
		// then the selected features
		
		for (var i=0;i<NumLayers;i++)
		{
			var TheLayer=this.GetChild(i);
		
			TheLayer.PaintSelected(TheView);
		}
	}
}

//******************************************************************
// CMGeo Functions
//******************************************************************
//******************************************************************
// Background Management
//******************************************************************
/*
* Adds a background layer to the scene
* @public
* @param TheLayer
* @returns LayerIndex 
*/
CMGeo.prototype.AddBackground=function(TheLayer) 
{
	TheLayer.SetParent(this);
	 
	var LayerIndex=this.Backgrounds.length;
	
	this.Backgrounds[LayerIndex]=TheLayer;
	
	if (this.SelectedBackgroundIndex==-1) this.SetSelectedBackgroundIndex(0);
	
	this.GetParent(CMScene).BackgroundListChanged();
	
	return(LayerIndex);
}
/*
* Sets which background will be selected for painting
* @public
* @param BackgroundIndex - 
*/
CMGeo.prototype.SetSelectedBackgroundIndex=function(New)
{
	if (New!=this.SelectedBackgroundIndex) // something has changed
	{
		if (this.SelectedBackgroundIndex!=-1) // make the current background layer invisible
		{
			this.Backgrounds[this.SelectedBackgroundIndex].SetVisible(false);
		}
		// set the new selected background layer (could be -1 for none)
		this.SelectedBackgroundIndex=New;
		
		if (New!=-1) // make the new layer visible
		{
			this.Backgrounds[New].SetVisible(true);
		}
		// notify the scene that the backgrounds have changed
		this.GetParent(CMScene).BackgroundListChanged();
		this.Repaint();
	}
}
CMGeo.prototype.GetNumBackgrounds=function()
{
	return(this.Backgrounds.length);
}
CMGeo.prototype.GetBackground=function(Index)
{
	return(this.Backgrounds[Index]);
}

//******************************************************************
// public CMGeo functions for layer Management
//******************************************************************
/*
* Adds a layer to the scene
* @public
* @param TheLayer
* @returns LayerIndex 
*/
CMGeo.prototype.AddLayer=function(TheLayer) 
{
	TheLayer.SetParent(this);
	
	var LayerIndex=this.Layers.length;
	
	this.Layers[LayerIndex]=TheLayer;
	
	// make sure the layer's time slices are reprented
	
	var NewTimes=TheLayer.GetTimes(this.Times);
	
	for (Time in NewTimes)
	{
		var Index=this.Times.indexOf(Time);
		
		if (Index==-1) // time slice is not in the time slice array
		{
			this.InsertTime(Time);
		}
	}
	this.GetParent(CMScene).LayerListChanged();
	
	return(LayerIndex);
}
/*
* Return the index for the specified layer.  If the 
* layer does not appear in the CMScene, return -1
* @public
* @param TheLayer - 
* @returns LayerIndex
*/
CMGeo.prototype.GetChildIndex=function(TheLayer) 
{
	var Result=-1;
	
	for (var i=0;i<this.Layers.length;i++)
	{
		if (this.Layers[i]==TheLayer) Result=i;
	}
	return(Result);
}
/*
* Returns the layer at the specified index.
* @public
* @param Index - 
* @returns TheLayer
*/
CMGeo.prototype.GetLayer=function(Index) 
{
	var Result=this.Layers[Index];
	
	return(Result);
}
/*
* Swap the layer with the one above it.
* @public
* @param Index - 
*/
CMGeo.prototype.MoveLayerUp=function(Index) 
{
	var TheLayer=this.Layers[Index];
	if (Index>=0)
	{
		this.Layers[Index]=this.Layers[Index-1];
		this.Layers[Index-1]=TheLayer;
	}
	this.GetParent(CMScene).LayerListChanged();
	this.Repaint();
}
/*
* Swap the specified layer with the one below it.
* @public
* @param Index - 
*/
CMGeo.prototype.MoveLayerDown=function(Index) 
{
	var TheLayer=this.Layers[Index];
	if (Index<this.Layers.length)
	{
		this.Layers[Index]=this.Layers[Index+1];
		this.Layers[Index+1]=TheLayer;
	}
	this.GetParent(CMScene).LayerListChanged();
	this.Repaint();
}

/**
* Remove the layer at the specified index from the list of layers
* @public
* @param Index - Index to the layer to delete
*/
CMGeo.prototype.RemoveChild=function(Index) 
{
	if (typeof(Index)!="number") Index=this.GetChildIndex(Index);
	
	var TheObject=this.GetChild(Index);
	
	this.Layers.splice(Index,1);

	TheObject.SetParent(null);

	this.GetParent(CMScene).LayerListChanged();
	
	this.Repaint();
	
	return(Result);
}
/**
* Moves a layer to a new position in the layer list 
* @public
* @param TheLayer - The layer to move
* @param NewIndex - Index to the new position for the layer
*/
CMGeo.prototype.MoveLayer=function(TheLayer,NewIndex) 
{
	var CurrentIndex=this.GetChildIndex(TheLayer);
	
	// make sure the new index is still within the list of layers
	
	if (NewIndex<0) NewIndex=0;
	if (NewIndex>=this.Layers.length) NewIndex=this.Layers.length-1;
	
	if (NewIndex<CurrentIndex) // move the layer up in the list (shift the layers from the new index to the old down one layer
	{
		for (var i=CurrentIndex;i>NewIndex;i--)
		{
			this.Layers[i]=this.Layers[i-1];
		}
		this.Layers[NewIndex]=TheLayer;
	}
	else if (NewIndex>CurrentIndex) // move the layer down in the list
	{
		for (var i=CurrentIndex;i<NewIndex;i++)
		{
			this.Layers[i]=this.Layers[i+1];
		}
		this.Layers[NewIndex]=TheLayer;
	}
	this.GetParent(CMScene).LayerListChanged();
	
	this.Repaint();
}
//******************************************************************
// Additional public functions
//******************************************************************
/**
* Set the projection for coordinate conversion
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CMGeo.prototype.SetProjector=function(TheProjector) 
{ 
	this.TheProjector=TheProjector; 
	
	TheProjector.AddListener(CMBase.MESSAGE_SETTINGS_CHANGED,this,function(TheDataset,This,AdditionalInfo)
	{
		var NumLayers=This.GetNumChildren(CMLayer);
		
		for (var i=0;i<NumLayers;i++)
		{
			var TheLayer=This.GetChild(i);
		
			TheLayer.ProjectorChanged();
		}
	});
	// jjg - should be a message
	var NumLayers=this.GetNumChildren(CMLayer);
	
	for (var i=0;i<NumLayers;i++)
	{
		var TheLayer=this.GetChild(i);
	
		TheLayer.ProjectorChanged();
	}
};
	
CMGeo.prototype.GetProjector=function() 
{ 
	return(this.TheProjector); 
};

/**
* Set the projector type to be NONE, COORDINATES, 
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CMGeo.prototype.SetProjectorType=function(ProjectorType) 
{ 
	this.ProjectorType=ProjectorType; 
};
CMGeo.prototype.GetProjectorType=function() 
{ 
	return(this.ProjectorType); 
};

/**
* Called by layers to force the bounds to be recomputed.
* @protected
*/
CMGeo.prototype.SetBoundsDirty=function() 
{ 
	this.TheBounds=null;
}
/**
* Gets the bounds of all the layer bounds combined.
* @public
*/
CMGeo.prototype.GetBounds=function() 
{ 
	var NumLayers=this.GetNumChildren(CMLayer);
	
	if ((NumLayers>0)&&(this.TheBounds==null)) // bounds is dirty and we have layer data
	{
		for (var i=0;i<NumLayers;i++)
		{
			var TheLayer=this.GetChild(i,CMLayer);
			
			var TheBounds=TheLayer.GetBounds();
			
			if ((this.TheBounds==null)&&(TheBounds!=null))
			{
				this.TheBounds=CMUtilities.CloneBounds(TheBounds);
			}
			else if (TheLayer.TheBounds!=null)
			{
				CMUtilities.AddToBounds( this.TheBounds,TheBounds);
			}
		}
	}
	return(this.TheBounds);
}
/**
* Insert a Time in the appropraite location in the array
* @public 
* @param Time - the time slice to insert
*/
CMGeo.prototype.InsertTime=function(Time) 
{
	Time=parseFloat(Time); // make sure we have a number

	CMUtilities.InsertIntoSortedArray(this.Times,Time);
	
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_SLICES_CHANGED);

}
/**
* Remove the entry for the specified Time
* @public 
* @param Time - the time slice to delete
*/
CMGeo.prototype.DeleteTime=function(Time) 
{ 
	Time=parseFloat(Time); // make sure we have a number

	var Index=this.Times.indexOf(Time);
	if (Index!=-1)
	{
		this.Times.splice(Index,1);
	}
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_SLICES_CHANGED);
}



//CanvasMap/js/CMScene.js
/******************************************************************************************************************
* CMScene
*
* @module CMScene
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Global definitions
//******************************************************************

/**
* This is the main rendering loop for all scenes and views.
* The function runs continuously.
* @private
*/
function CMRenderScenes() 
 {
	 if (RenderingScene==false)
	 {
		RenderingScene=true; // keep us from being reentrant
		 
		for (var i=0;i<CMScene.TheScenes.length;i++)
		{
			var TheScene=CMScene.TheScenes[i];
		
			var TheView=TheScene.GetView(0);
			TheScene.Paint(TheView);
		}
		RenderingScene=false;
	 }
	requestAnimationFrame(CMRenderScenes);
}
var RenderingScene=false;

// get the scenes started rendering

requestAnimationFrame(CMRenderScenes);

// global variables for tracking the scenes
CMScene.TheScenes=[];

CMScene.NumScenes=0;

//******************************************************************
// Global CMScene definitions
//******************************************************************

/**
* Message definitions
*/
CMScene.MESSAGE_LAYER_LIST_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_LAYER_CONTENT_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_LAYER_SETTINGS_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_BACKGROUNDS_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_TIME_SLICES_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_TIME_RANGE_CHANGED=CMBase.GetUniqueNumber();
CMScene.MESSAGE_SELECTION_CHANGED=CMBase.GetUniqueNumber();

//******************************************************************
// CMScene Class
//******************************************************************
/*4
* Constructor for the CMScene class
* @public, @constructs
*/
function CMScene(TheCanvasMap) 
{
	CMItem.call(this);

	this.SetParent(TheCanvasMap);
	
	// Global Static variables
	CMScene.TheScenes.push(this);
	CMScene.NumScenes++;
	
	// Properties
	this.Views=[]; // jjg - move to children?
	
 	this.MinTime=0; 
	
	// private properties
	this.Times=[0];
	
	this.TheBounds=null;

	this.NumRepaintBlocks=0;
	this.NeedRepaint=false; // needs to move into the view in the future
	
	// provide good default settings
	this.SetSetting("Style","fillStyle","rgb(210,220,255)"); // 

	this.SetSetting("Item","Name","Scene_"+CMScene.NumScenes);
}

CMScene.prototype=Object.create(CMItem.prototype); // inherit prototype functions from PanelBase()

CMScene.prototype.contructor=CMScene; // override the constructor to go to ours

//******************************************************************
//  Protected functions
//******************************************************************
/*
* Allows layers to get the view that they are drawn in.
* @protected
* @param ViewIndex - allows future expansion to have mulitple views in one scene
*/
CMScene.prototype.GetView=function(ViewIndex) 
{
	var Result=null;
	
	if (ViewIndex==undefined) ViewIndex=0;
	
	Result=this.Views[ViewIndex];
	
	return(Result);
}
CMScene.prototype.GetNumViews=function() 
{
	var Result=this.Views.length;
	
	return(Result);
}
/*
* Allos the view to be replaced
*/
CMScene.prototype.SetView=function(ViewIndex,NewView) 
{
	NewView.SetParent(this);
	
	this.Views[ViewIndex]=NewView;
}

//******************************************************************
// CMBase Functions
//******************************************************************

CMScene.prototype.GetTimes=function(TheTimeSlices) 
{
	return(this.Times);
}
//******************************************************************
// Background Management
//******************************************************************
/*
* Adds a background layer to the scene
* @public
* @param TheLayer
* @returns LayerIndex 
*/
CMScene.prototype.AddBackground=function(TheLayer) 
{
	var Index=this.GetChild(0,CMGeo).AddBackground(TheLayer);
	
	return(Index);
}
/*
* Sets which background will be selected for painting
* @public
* @param BackgroundIndex - 
*/
CMScene.prototype.SetSelectedBackgroundIndex=function(New)
{
	var Index=this.GetChild(0,CMGeo).SetSelectedBackgroundIndex(New);
}


//******************************************************************
// public CMScene functions for Geo Management
//******************************************************************
/*CMScene.prototype.SetGeo=function(NewGeo,Index)
{
	if (Index==undefined) Index=0;
	
	if (this.Geos==null) { this.Geos=[]; }
	
	this.Geos[Index]=NewGeo;
};*/
CMScene.prototype.GetGeo=function(Index)
{
	if (Index==undefined) Index=0;
	
	return(this.GetChild(Index,CMGeo));
};
//******************************************************************
// public CMScene functions for layer Management
//******************************************************************
/*
* Adds a layer to the scene
* @public
* @param TheLayer
* @returns LayerIndex 
*/
CMScene.prototype.AddLayer=function(TheLayer,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	var LayerIndex=this.GetChild(GeoIndex,CMGeo).AddLayer(TheLayer);
	
	return(LayerIndex);
}

// these get moved to CMBase as child functions
/*
* Return the index for the specified layer.  If the 
* layer does not appear in the CMScene, return -1
* @public
* @param TheLayer - 
* @returns LayerIndex
*/
CMScene.prototype.GetChildIndex=function(TheLayer,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	var Result=this.GetChild(GeoIndex,CMGeo).GetChildIndex(TheLayer);
	
	return(Result);
}
/*
* Returns the layer at the specified index.
* @public
* @param Index - 
* @returns TheLayer
*/
CMScene.prototype.GetLayer=function(LayerIndex,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	var Result=this.GetChild(GeoIndex,CMGeo).GetLayer(LayerIndex);
	
	return(Result);
}

/*
* Swap the layer with the one above it.
* @public
* @param Index - 
*/
CMScene.prototype.MoveLayerUp=function(Index,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	var Result=this.GetChild(GeoIndex,CMGeo).MoveLayerUp(Index);
}
/*
* Swap the specified layer with the one below it.
* @public
* @param Index - 
*/
CMScene.prototype.MoveLayerDown=function(Index,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	var Result=this.GetChild(GeoIndex,CMGeo).MoveLayerDown(Index);
}

/**
* Remove the layer at the specified index from the list of layers
* @public
* @param Index - 
*/
CMScene.prototype.DeleteLayer=function(Index,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	var Result=this.GetChild(GeoIndex,CMGeo).RemoveChild(Index);
	return(Result);
}
/**
* Moves a layer to a new position in the layer list 
* @public
* @param TheLayer - 
* @param NewIndex - 
*/
CMScene.prototype.MoveLayer=function(TheLayer,NewIndex,GeoIndex) 
{
	if (GeoIndex==undefined) GeoIndex=0;
	
	this.GetChild(GeoIndex,CMGeo).MoveLayer(TheLayer,NewIndex);
}
//******************************************************************
// Search
//******************************************************************
/**
* Get the search results from each layer.  The layers will insert 
* elements into the SearchResults element
*
* Called by CanvasMap
* @protected
*/
CMScene.prototype.GetSearchResults=function(TheText,SearchResults) 
{
	this.GetChild(0,CMGeo).GetSearchResults(TheText,SearchResults);

}
//******************************************************************
// Map Elements
//******************************************************************
/**
* Add a new map element to the scene (e.g. a scale bar) (jjg being depracated)
* @public
* @param TheElement - 
*/
CMScene.prototype.AddMapElement=function(TheElement) 
{
	this.Views[0].AddMapElement(TheElement);
}

//******************************************************************
// Messages from the views that are then sent to the layers
//******************************************************************
/**
* Called by CanvasMap to add a view for this scene.
* @protected
*/
CMScene.prototype.AddView=function(TheView) 
{
	var ViewIndex=this.Views.length;
	
	this.SetView(ViewIndex,TheView);
	
	this.SetTimeRange(0);
}

/**
* Sets the minimum and maximum time for elements in the map.
* This is under development and currently layers need to
* check the time before painting into the view.
* @public
* @param MinTime - lowest allowed value for the time
*/
CMScene.prototype.SetTimeRange=function(MinTime)
{
	this.MinTime=MinTime;
	
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_RANGE_CHANGED);
}
/**
* Gets the current setting for the time range.
* @public
* @returns time range as a JSON object with MinTime, MaxTime
*/
CMScene.prototype.GetTimeRange=function()
{
	return(this.MinTime);
}

//******************************************************************
// Event handlers
//******************************************************************
/*
* Not used
*/
CMScene.prototype.In=function(TheView,RefX,RefY,TheEvent) 
{
	var Result=null;
	
	// in operates the opposite direction as painting
	
	var NumGeos=this.GetNumChildren(CMGeo);
	
	for (var i=NumGeos-1;(i>=0)&&(Result==null);i--)
	{
		var TheGeo=this.GetChild(i,CMGeo);
		
		var Result=TheGeo.In(TheView,RefX,RefY,TheEvent);
		
		if (Result!=null) Result.GeoIndex=i;
	}
	return(Result);
};


//******************************************************************
// Painting
//******************************************************************
/**
* Called when the window is resized
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMScene.prototype.Resize=function(TheView) 
{
	var NumGeos=this.GetNumChildren(CMGeo);
	
	for (var i=0;i<NumGeos;i++)
	{
		var TheGeo=this.GetChild(i,CMGeo);
		
		TheGeo.Resize(TheView);
	}
	// resize the views
	
	for (var i=0;i<this.Views.length;i++)
	{
		this.Views[i].Resize();
	}
	this.Repaint();
}
//*****************************************************************************
// Below is the code to repaint the views as needed
// To do:
// - Move the "NeedPaint" flag into the view
//*****************************************************************************

CMScene.prototype.Paint=function(TheView) 
{
	var NeedRepaint=this.NeedRepaint;
	
	if ((typeof(CM3Scene)!== 'undefined')&&(this instanceof CM3Scene)) NeedRepaint=true;
	
	if ((this.NumRepaintBlocks==0)&&(NeedRepaint))
	{
		this.NeedRepaint=false;
		
		this.IncrementRepaintBlocks();
		
		// let the view know we are starting
		
		TheView.PaintStart();
		
		// clear the background
		
		var Style=this.GetStyle(TheView,0);
		
		if (Style!=undefined)
		{
			TheView.SetStyle(Style);
			TheView.PaintBackground();
			TheView.RestoreStyle();
		}
		
		// then the other layers
		
		var NumChildren=this.GetNumChildren();
	
		for (var i=0;i<NumChildren;i++)
		{
			var TheChild=this.GetChild(i);
		
			TheChild.Paint(TheView);
		}
		
		//
		TheView.PaintEnd();
		
		//
		
		this.DecrementRepaintBlocks();
		
		if (this.NeedRepaint) this.Repaint();
	}

}
/**
* Called by the layers to repaint the scene
* @public
* @override
* @param TheView - the view that recieved the event
*/
CMScene.prototype.Repaint=function() 
{
	if (this.Views!=null)
	{
		for (var i=0;i<this.Views.length;i++)
		{
			this.NeedRepaint=true;
//			this.Paint(this.Views[i]); // jjg for now
		}
	}
}
/**
* Called to block repainting when a large number of settings are made that would all
* generate repaints.
* @protected
*/
CMScene.prototype.IncrementRepaintBlocks=function()
{
	this.NumRepaintBlocks++;
}
/**
* Calls to IncrementRepaintBlocks must be paired with calls to this function.
* generate repaints.
* @protected
*/
CMScene.prototype.DecrementRepaintBlocks=function()
{
	this.NumRepaintBlocks--;
}
//******************************************************************
// Layer List functions
//******************************************************************
/**
* Called from a scene to indicate that a layer's settings changed.
* @protected
* @param TheLayer
*/
CMScene.prototype.LayerListChanged=function()
{
	this.SendMessageToListeners(CMScene.MESSAGE_LAYER_LIST_CHANGED,this);
}
CMScene.prototype.LayerContentChanged=function(ItemThatChanged)
{
	this.SendMessageToListeners(CMScene.MESSAGE_LAYER_CONTENT_CHANGED,ItemThatChanged);
}
CMScene.prototype.LayerSettingsChanged=function(ItemThatChanged)
{
	this.SendMessageToListeners(CMScene.MESSAGE_LAYER_SETTINGS_CHANGED,ItemThatChanged);
	this.Repaint();
}
CMScene.prototype.SelectionChanged=function(ItemThatChanged)
{
	this.SendMessageToListeners(CMScene.MESSAGE_SELECTION_CHANGED,ItemThatChanged);
	this.Repaint();
}
CMScene.prototype.BackgroundListChanged=function()
{
	this.SendMessageToListeners(CMScene.MESSAGE_BACKGROUNDS_CHANGED,this);
}

//******************************************************************
// Additional public functions
//******************************************************************
/**
* Set the projection for coordinate conversion
* @public
* @param TheProjector - the projector to use to project coordinates
*/
CMScene.prototype.SetProjector=function(TheProjector,GeoIndex) 
{ 
	if (GeoIndex==undefined) GeoIndex=0;
	
	var TheGeo=this.GetChild(GeoIndex,CMGeo);
	
	if (TheGeo!=null) TheGeo.SetProjector(TheProjector);
	else alert("Sorry, the Geo must be setup before the projector can be set");
}
CMScene.prototype.GetProjector=function(GeoIndex) 
{ 
	if (GeoIndex==undefined) GeoIndex=0;
	
	var TheProjector=null;
	
	var TheGeo=this.GetChild(GeoIndex,CMGeo);
	
	if (TheGeo!=null) TheProjector=TheGeo.GetProjector();
							
	return(TheProjector); 
}

/**
* Called by layers to force the bounds to be recomputed.
* @protected
*/
CMScene.prototype.SetBoundsDirty=function() 
{ 
	this.TheBounds=null;
}
/**
* Gets the bounds of all the geo bounds combined.
* @public
*/
CMScene.prototype.GetBounds=function() 
{ 
	var NumGeos=this.GetNumChildren(CMGeo);
	
	if ((NumGeos>0)&&(this.TheBounds==null)) // bounds is dirty and we have layer data
	{
		for (var i=0;i<NumGeos;i++)
		{
			var TheGeo=this.GetChild(i,CMGeo);
			
			var TheGeoBounds=TheGeo.GetBounds();
			
			if (TheGeoBounds!=null)
			{
				if (this.TheBounds==null) // create for the first time
				{
					this.TheBounds=CMUtilities.CloneBounds(TheGeoBounds);
				}
				else // add this features bounds to the current bounds
				{
					CMUtilities.AddToBounds(this.TheBounds,TheGeoBounds);
				}
			}
		}
	}
	return(this.TheBounds);
}
/**
* Insert a Time in the appropraite location in the array
* @public 
* @param Time - the time slice to insert
*/
CMScene.prototype.InsertTime=function(Time) 
{
	Time=parseFloat(Time); // make sure we have a number

	CMUtilities.InsertIntoSortedArray(this.Times,Time);
	
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_SLICES_CHANGED);
}
/**
* Remove the entry for the specified Time
* @public 
* @param Time - the time slice to delete
*/
CMScene.prototype.DeleteTime=function(Time) 
{ 
	Time=parseFloat(Time); // make sure we have a number

	var Index=this.Times.indexOf(Time);
	if (Index!=-1)
	{
		this.Times.splice(Index,1);
	}
	this.SendMessageToListeners(CMScene.MESSAGE_TIME_SLICES_CHANGED);
}


/**
* Unselect all information in the layers
* @public
*/
CMScene.prototype.CMItem_UnselectAll=CMItem.prototype.UnselectAll;

CMScene.prototype.UnselectAll=function(SendMessageFlag) 
{
	this.CMItem_UnselectAll(SendMessageFlag);
	
	var NumGeos=this.GetNumChildren(CMGeo);
	
	for (var i=0;i<NumGeos;i++)
	{
		var TheGeo=this.GetChild(i);
		
		TheGeo.UnselectAll(SendMessageFlag);
	}

}


//CanvasMap/js/CMTile.js
/******************************************************************************************************************
* CMTile
*
* @module CMTile
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//******************************************************************
// Constants
//******************************************************************

// Definitions for the corners for polygons drawn in the tile

CMTile.UPPER_RIGHT=-1;
CMTile.LOWER_RIGHT=-2;
CMTile.LOWER_LEFT=-3;
CMTile.UPPER_LEFT=-4;

//******************************************************************
// Global Variables
//******************************************************************

// A count of the total number of tiles that have been loaded for debugging and performance monitoring
CMTile.NumTilesLoaded=0;

// static variables for the loader and the material (the material does not change the appearance of the tiles so it is just created once)
CMTile.TheLoader=null;
CMTile.TheMaterial=null;

//******************************************************************
// Tile Constructor
//******************************************************************
function CMTile(TheDataset,ZoomLevel,GlobalColumn,GlobalRow)
{
	this.GlobalRow=GlobalRow;
	this.GlobalColumn=GlobalColumn;
	this.ZoomLevel=ZoomLevel;

	this.TheData=null; // the original tile.js information with vector data
	this.TheRaster=null; // raster image
	this.TheRasterRequest=null;
	
	this.ChildTiles=null;
	this.TheDataset=TheDataset;
	
	this.LoadStatus=CMDataset.LOAD_STATUS_NONE;
	this.TheRequest=null;
	
	this.PaintTileInfo=false; // for debugging
	
	// 3D Variables
	this.TheMesh=null;
	this.MeshIsInGeo=false;
}
//***********************************************************************
// Private static functions
//***********************************************************************
/**
* Creates a grid of pixels to match the specified extent
* @static
* @private
*/
CMTile.GetSubSample=function(RequestedExtent,DEMTile,Exaggeration) 
{
	var DEMData=DEMTile.GetData();
	
	var DEMRefBounds=DEMData.RasterData.Bounds;
	
	// get the pixels, num columns and rows from the DEM
	var DEMPixelMatrix=DEMData.RasterData.Data;
	var DEMMaskMatrix=DEMData.RasterData.Mask;
	
	var DEMNumColumns=DEMPixelMatrix[0].length;
	var DEMNumRows=DEMPixelMatrix.length;
	
	// find the ref dimensions of the DEM tile
	var DEMRefWidth=DEMRefBounds.XMax-DEMRefBounds.XMin;
	var DEMRefHeight=DEMRefBounds.YMax-DEMRefBounds.YMin;
	
	// find the width of the columns and rows in the dem
	var DEMColumnWidth=DEMRefWidth/DEMNumColumns;
	var DEMRowHeight=DEMRefHeight/DEMNumRows;
	
	// find the ref dimensions of the requested area 
	var RequestedRefWidth=RequestedExtent.XMax-RequestedExtent.XMin;
	var RequestedRefHeight=RequestedExtent.YMax-RequestedExtent.YMin; // note this is positive
	
	// find the offset to the left side of the requested area in the DEM tile
	var LeftRefOffset=RequestedExtent.XMin-DEMRefBounds.XMin;
	
	// find the left-most column in the DEM tile
	var DEMStartColumn=CMUtilities.Truncate(LeftRefOffset/DEMColumnWidth);
	
	// find the bottom row in the DEM tile from the offset to the bottom of the requested area in the DEM tile
	var BottomRefOffset=RequestedExtent.YMin-DEMRefBounds.YMin;
	var DEMStartRow=CMUtilities.Truncate(BottomRefOffset/DEMRowHeight);
	
	// for now we always generate 64 rows and columns in the output
	var OutputNumRows=64;
	var OutputNumColumns=64;
	
	var SampleRate=RequestedRefWidth/(DEMColumnWidth*OutputNumColumns);
	
	var OutputColumnWidth=RequestedRefWidth/OutputNumColumns;
	var OutputRowHeight=RequestedRefHeight/OutputNumRows;
	
	//
	var ThePixels=[];
	var TheMask=[];
	
	for (var y=0;y<=OutputNumRows;y++)
	{
		ThePixels[y]=[];
		TheMask[y]=[];
		
		var Y=(RequestedExtent.YMin+(y*OutputRowHeight));
		
		for (var x=0;x<=OutputNumColumns;x++)
		{
			var X=(RequestedExtent.XMin+(x*OutputColumnWidth));
			 
			try
			{
				var TempY=256-(DEMStartRow+y*SampleRate);
				TempY=Math.floor(TempY);
				if (TempY>255) TempY=255;
				if (TempY<0) TempY=0;
				
				var TempX=DEMStartColumn+x*SampleRate;
				TempX=Math.floor(TempX);
				if (TempX>255) TempX=255;
				if (TempX<0) TempX=0;
				
				var Z=DEMPixelMatrix[TempY][TempX];
				
				Z=Z*Exaggeration; // exageration setting for this
				//Z=-Z*10;
				if (Z==-0) Z=0;
				
				if (Z!=0)
				{
					var j=12;
				}
				ThePixels[y][x]=[];
				ThePixels[y][x][0]=X;
				ThePixels[y][x][1]=Y;
				ThePixels[y][x][2]=Z;
				
				TheMask[y][x]=DEMMaskMatrix[TempY][TempX];
			}
			catch(Error)
			{
				var j=12;
				//alert(Error);
			}
		}
	}
	var TheResult=[ThePixels,TheMask];
	// compute intersectin of two extents
	
	return(TheResult);

}
//******************************************************************
// Private CMTile functions
//******************************************************************

/**
* Return the coordinates for a single polygon.  This involves converting the
* edges and sides of tiles into polygons and returning their coordinates.
* @private
*/
CMTile.prototype.GetPolygonCoordinates=function(TheEdges,TheArea,PolyIndex,PaintedEdges) 
{
	Result=null;
	
	var Factor=1/Math.pow(2,this.ZoomLevel); // width of one pixel
	var TileRefWidth=256*Factor;
	
	var RefX=(this.GlobalColumn*TileRefWidth);
	var RefY=(this.GlobalRow*TileRefWidth);
	
	var TileRefLeft=RefX
	var TileRefRight=RefX+TileRefWidth;
	var TileRefTop=RefY+TileRefWidth;
	var TileRefBottom=RefY;
	
	//
	
	var ThePolys=TheArea.Polys;
	
	var ThePoly=ThePolys[PolyIndex];
		
	if ((ThePoly.Closed)&&(ThePoly.EdgeIndexes.length==1)) // paint closed polys (both edges and fills)
	{
		var EdgeIndex=ThePoly.EdgeIndexes[0];
		
		try
		{
			var TheEdge=TheEdges[EdgeIndex];
			
			Result={ Xs:TheEdge.Xs,Ys:TheEdge.Ys };
		}
		catch( e)
		{
			throw(e);
		}
		if (PaintedEdges!=null) PaintedEdges[EdgeIndex]=true;
	}
	else // fill unclosed polys
	{
		var Xs=[];
		var Ys=[];
		var NumCoordinates=0;
		
		for (var PolyEdgeIndex=0;PolyEdgeIndex<ThePoly.EdgeIndexes.length;PolyEdgeIndex++)
		{
			var EdgeIndex=ThePoly.EdgeIndexes[PolyEdgeIndex];
			var EdgeDirection=true; // forward
			
			if (ThePoly.EdgeDirections!=undefined) EdgeDirection=ThePoly.EdgeDirections[PolyEdgeIndex];
			
			if (EdgeIndex>=0) // real edge
			{
				var EdgeXs=TheEdges[EdgeIndex].Xs;
				var EdgeYs=TheEdges[EdgeIndex].Ys;
				
				for (var k=0;k<EdgeXs.length;k++)
				{
					if (EdgeDirection)
					{
						Xs[NumCoordinates]=EdgeXs[k];
						Ys[NumCoordinates]=EdgeYs[k];
					}
					else
					{
						Xs[NumCoordinates]=EdgeXs[EdgeXs.length-k-1];
						Ys[NumCoordinates]=EdgeYs[EdgeXs.length-k-1];
					}
					NumCoordinates++;
				}
				if (PaintedEdges!=null) PaintedEdges[EdgeIndex]=true;
			}
			else // add a corner
			{
				switch (EdgeIndex)
				{
				case CMTile.UPPER_RIGHT:
					Xs[NumCoordinates]=TileRefRight
					Ys[NumCoordinates]=TileRefTop
					NumCoordinates++;
					break;
				case CMTile.LOWER_RIGHT:
					Xs[NumCoordinates]=TileRefRight
					Ys[NumCoordinates]=TileRefBottom
					NumCoordinates++;
					break;
				case CMTile.LOWER_LEFT:
					Xs[NumCoordinates]=TileRefLeft
					Ys[NumCoordinates]=TileRefBottom
					NumCoordinates++;
					break;
				case CMTile.UPPER_LEFT:
					Xs[NumCoordinates]=TileRefLeft
					Ys[NumCoordinates]=TileRefTop
					NumCoordinates++;
					break;
				}
			}
		}
		Result={ Xs:Xs,Ys:Ys };
//											TheView.PaintRefPoly(Xs,Ys,true);
//		}
	}
	return(Result);
}
//******************************************************************
// Private CMTile functions
//******************************************************************
/**
* Called by parent tiles (or dataset) until an set of data is found
* that overlaps with the requested tile
* @private
*/
CMTile.prototype.GetDataForTextureTile=function(TheView,TheTextureTile,Exaggeration,TheLayer)
{
	var Result=null;
	
	if (this.LoadStatus==CMDataset.LOAD_STATUS_NONE)
	{
		this.LoadTile(TheView);
	}
	else if (this.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
	{
		var RequestedExtent=TheTextureTile.GetTileExtent(TheLayer);
		var ThisExtent=this.GetTileExtent(TheLayer);
		
		if (CMUtilities.BoundsIncludes(ThisExtent,RequestedExtent))
		{
			if (this.DatasetRaster!=null)
			{
				Result=CMTile.GetSubSample(RequestedExtent,this,Exaggeration);
			}
		}
		else						  
		{			
			for (var Row=0;(Row<2)&&(Result==false);Row++)
			{
				for (Column=0;(Column<2)&&(Result==false);Column++)
				{
					var TheChildTile=this.Tiles[Row][Column];
					
					Result=TheChildTile.GetDataForTextureTile(TheView,TheTextureTile,Exaggeration,TheLayer);
				}
			}
		}
	}
	return(Result);
}
//******************************************************************
// Protected CMTile Get/Set functions 
//******************************************************************
/**
* Allows a terrain tile to access the JSON data for a DEM that is stored in
* this tile
* @protected
*/
CMTile.prototype.GetData=function() 
{
	return(this.TheData);
}
/**
* Sets the file extenion used by GetTileImageFilePath()
* @protected
*/
CMTile.prototype.SetFileExtension=function(FileExtension) 
{
	this.Extension=FileExtension;
}
//******************************************************************
// Protected CMTile functions
//******************************************************************
/**
* Hide the mesh when the layer goes invisible
* @protected
*/
CMTile.prototype.HideMesh=function(TheLayer) 
{
	if (this.MeshIsInGeo) // need to remove this tile from mesh
	{
		var TheGeo=TheLayer.GetParent(CMGeo);
		TheGeo.RemoveOGLObject(this.TheMesh);
		this.MeshIsInGeo=false;
	}
}

/**
* Hides this tiles child tiles.  If called with HideSelf true, will also hide this tiles data
* and then will call child tiles to hide themselves.  Called by the dataset and then each
* parent tile calls its children.
*
* @protected
*/
CMTile.prototype.HideTiles=function(TheLayer,HideSelf) 
{ 
	if (HideSelf) this.HideMesh(TheLayer);

	if (this.ChildTiles!=null)
	{
		for (var RowIndex=0;RowIndex<2;RowIndex++)
		{
			if (this.ChildTiles[RowIndex]!=null)
			{
				for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
				{
					if (this.ChildTiles[RowIndex][ColumnIndex]!=null)
					{
						var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];
						
						TheChildTile.HideTiles(TheLayer,true);
					}
				}
			}
		}
	}
}

//******************************************************************
// CMTile static functions used by subclasses (e.g. CMTileOpenFormat)
// To display tiles in 3D
//******************************************************************
/**
* Get the material for displaying a tile in 3D.  The material is 
* unique for each tile and manages loading the tile
* @protected
*/
CMTile.GetNewMaterial=function(TheFileName) 
{
	var texloader = new THREE.TextureLoader();
	texloader.crossOrigin = '';

	var Opacity=1;
	var Color=0x00ffff;
	var Transparent=false;
	var Side=THREE.FrontSide;
	
	var SolidColorMaterial=new THREE.MeshLambertMaterial({
		  color: Color,
		  side:Side ,
		  opacity:Opacity,
		  transparent :false
	});	
	//console.log("CMTileOpenFormat: Loading: "+TheFileName);
	
	SolidColorMaterial.map=texloader.load(TheFileName);

	return(SolidColorMaterial);
}
/**
* Provides the distance from the View to the Tile extent
* Should probably be in the Geo class as the distance varies
* based on the projection.
*
* Extent - extent of the tile in geographic
* @protected
*/
CMTile.GetDistanceTo3DView=function(TheView,Extent,TheLayer) 
{
	var TheGeo=TheLayer.GetParent(CMGeo);
	var CameraPosition=TheView.GetPosition();
	
	// find the center of the tile
	var	Lon=(Extent.XMin+Extent.XMax)/2;
	var Lat=(Extent.YMin+Extent.YMax)/2;
	var Elevation=0;
	
	if (true)
	{
		// get the location of the tile in 3D coordinates
		var Result=TheGeo.ProjectFromGeographic(Lon, Lat, Elevation);
//		var Vector1=CMTile.GetGlobalCoordinate(TheLayer,OX,OY,0); // project to geographic and then to the current projection (could be spherical)
		
		OX=Result[0];
		OY=Result[1];
		OZ=Result[2];
	}
	var DX=CameraPosition.x-OX;
	var DY=CameraPosition.y-OY; // y is negative
	var DZ=CameraPosition.z-OZ;
	
	var Distance=Math.sqrt((DX*DX)+(DY*DY)+(DZ*DZ));
	
	return(Distance);
}


//******************************************************************
// Protected CMTile functions
//******************************************************************

/**
* Utility function to get the extent of this tile in the tile's spatial reference system.
*
* Note that this function and the CMTileOpenFormat function are slightly different
* in tha the y direction is handled differently
*
* @protected
*/
CMTile.prototype.GetTileExtent=function(TheLayer) 
{
	var Factor=1/Math.pow(2,this.ZoomLevel); // width of one pixel
	var TileRefWidth=256*Factor;
	
	var RefX=(this.GlobalColumn*TileRefWidth);
	var RefY=(this.GlobalRow*TileRefWidth); // rows for BlueSpray tiles are 0 on top and negative numbers going down
	
	var Extent={
		"XMin":RefX,
		"XMax":RefX+TileRefWidth,
		"YMax":RefY+TileRefWidth, // top of the tile
		"YMin":RefY // bottom of the tile
	}
	return(Extent);
}

/**
* Utility function to get the extent of this tile in geographic coordinates
*
* @protected
*/
CMTile.prototype.GetTileExtentAsGeographic=function(TheLayer) 
{
	var TheProjector=this.TheDataset.GetProjector();

	var Extent=this.GetTileExtent(TheLayer);
	
	if (TheProjector!=null)
	{
		var Result1=TheProjector.ProjectToGeographic(Extent.XMin,Extent.YMin);
		var Result2=TheProjector.ProjectToGeographic(Extent.XMax,Extent.YMax);
		
		Extent.XMin=Result1[0];
		Extent.YMin=Result1[1];
		Extent.XMax=Result2[0];
		Extent.YMax=Result2[1];
	}
	return(Extent);
}
/**
* Utility function to get the extent of this tile in global coordinates.
* This means the extent is projected from its native spatial reference,
* to geographic, and then to the global spatial reference using the 
* projector in the Geo, if any.
*
* @protected
*/
CMTile.prototype.GetTileWidthAsGlobal=function(TheLayer)
{
	var Width=0;
	
	var TheGeo=TheLayer.GetParent(CMGeo);

	var TheProjector=TheGeo.GetProjector();
	
	var TheExtent=this.GetTileExtentAsGeographic(TheLayer);
	
	if (TheProjector!=null)
	{
		var Result1=TheProjector.ProjectFromGeographic(TheExtent.XMin,TheExtent.YMin,0);
		var Result2=TheProjector.ProjectFromGeographic(TheExtent.XMax,TheExtent.YMax,0);
				
		var DX=Result1[0]-Result2[0];
		var DY=Result1[1]-Result2[1];
		var DZ=Result1[2]-Result2[2];
		
		Width=Math.sqrt(DX*DX+DY*DY+DZ*DZ)*2/2;
	}
	else
	{
		var DX=TheExtent.XMax-TheExtent.XMin;
		var DY=TheExtent.YMax-TheExtent.YMin;
		
		Width=Math.sqrt(DX*DX+DY*DY)*2/2;
	}
	return(Width);
}

//******************************************************************
// Protected CMTile functions overriden by CMTileOpenFormat
//******************************************************************

/**
* Returns the full path to this tiles file
* @protected
*/
CMTile.prototype.GetTileImageFilePath=function() 
{
	var Extension=this.TheDataset.GetRasterFileExtension();
	
	var FileName="Tiles_"+this.ZoomLevel+"/"+(this.GlobalColumn)+"/"+(this.GlobalRow)+Extension;
	
	var ThePath=this.TheDataset.URL+FileName;
	
	return(ThePath);
}
/**
* Function to load a single raster tile.  This is called when a tile with an associated raster
* file (PNG) is recieved.
* @protected
*/
CMTile.prototype.LoadTileRaster=function() 
{
	// setup the new Image object to hold the raster (Image)
	
	this.TheRaster=new Image(); 
	this.TheRaster.TheTile=this;
	
	// set the URL of the image which will trigger the request
	
	var ThePath=this.GetTileImageFilePath();
	
	// build the request object
	this.TheRasterRequest=
	{
		LoadStatus:CMDataset.LOAD_STATUS_NONE,
		Type:CMDataset.REQUEST_TYPE_IMAGE,
		TheImage:this.TheRaster,
		src:ThePath,
		TheFunction:function()
		{ 
			this.TheTile.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_DATASET_TILE_LOADED,this.TheTile);
		}
	};
	this.TheRasterRequest.TheTile=this;
	
	//console.log("CMTile requesting tile: "+ThePath);
	
	// make the request
	CMDataset.MakeRequest(this.TheRasterRequest);
}
/*
* Sets up a grid-based goemetry to hold the coordinates for the projected space
* @protected
*/
CMTile.prototype.SetupGeometry=function(TheLayer) 
{
	var TheGeo=TheLayer.GetParent(CM3Geo);
	
	var TheGeographicExtent=this.GetTileExtentAsGeographic(TheLayer);
	
	var XMin=TheGeographicExtent.XMin;
	var XMax=TheGeographicExtent.XMax;
	var YMin=TheGeographicExtent.YMin;
	var YMax=TheGeographicExtent.YMax;
	
	var Width=XMax-XMin;
	var Height=YMax-YMin;
	
	var StartU=0; // x direction factors
	var EndU=1;
	var StartV=0;
	var EndV=1;
	
	if (XMin<-180) 
	{
		StartU=(-180-XMin)/Width;
		XMin=-180;
	}
	if (XMax>180) 
	{
		EndU=1-(XMax-180)/Width;
		XMax=180;
	}
	if (YMin<-90) 
	{
		StartV=(-90-YMin)/Height;
		YMin=-90;
	}
	if (YMax>90) 
	{
		EndV=1-(YMax-90)/Height;
		YMax=90;
	}
	var RowRefHeight=(YMax-YMin)/16;
	var ColumnRefWidth=(XMax-XMin)/16;
	
	var TheArray=[];
	
	for (var Row=0;Row<=16;Row++)
	{
		var TheRow=[];
		TheArray[Row]=TheRow;
		
		for (var Column=0;Column<=16;Column++)
		{
			TheRow[Column]=[];
			
			// convert tile coordinates to geographic
			var Lon=XMin+(Column*ColumnRefWidth);
			var Lat=YMin+(Row*RowRefHeight);
			
			// convert geographic coordinates to spherical
			var Elevation=0;//TheElevationGroup.Offset;
			
			// project the coordinate
			var Vector1=TheGeo.ProjectFromGeographic(Lon, Lat, Elevation);
			
			// setup the grid to contain the projected coordinate
			TheRow[Column]=Vector1;
			//TheRow[Column][1]=Vector1.y;
			//TheRow[Column][2]=Vector1.z;
		}
	}
	
	// setup the THREEE geomery which will become part of the mesh
	var NumColumns=TheArray[0].length;
	var NumRows=TheArray.length;
	
	var TheGeometry=new CM3SurfaceGeometry(NumColumns-1,NumRows-1,null,StartU,EndU,StartV,EndV);
	
	// set the positions within the grid
	TheGeometry.SetPositions(TheArray);
				
	return(TheGeometry);
}


//******************************************************************
// Painting Functions
//******************************************************************
/*
* Check if we should paint this tile or it's four child tiles.
* 
* This is a little complicated because we have to
* decide if we are going to paint this tile or paint it's children.
* If we are painting this tile, then we either need to paint the vectors
* fill the tile with a single color (uniform raster pixel or tile in the
* middle of a filled polygon
*
* Algorithm to decide if painting this tile:
*
* 	if PaintDebugTile) paint this tile
* 	else
* 		if this tile's pixel width is less than or equal to 256 paint this tile
* 		else 
* 			if any of the children have not been loaded paint this tile (and load the children)
*			if any of the children are still loading, paint this tile
*			count the number of child tiles that are
*				loaded and
*				vector data or raster data with a color or a loaded raster tile
*				or empty tiles
*			if the number is less than 4, paint this tile
*
* @protected
*/

CMTile.prototype.CheckPaintTile=function(TheLayer,TheView,ThisStepTileRefWidth) 
{
	var PaintTile=false; 

	// see if we should paint because we are debugging a tile
	if (this.TheDataset.PaintDebugTile)
	{
		if ((this.TheDataset.DebugZoomLevel==this.ZoomLevel)&&
			(this.TheDataset.DebugGlobalColumn==this.GlobalColumn)&&
			(this.TheDataset.DebugGlobalRow==this.GlobalRow))
		{
			PaintTile=true; // paint the tile being debugged
		}
	}
	else // otherwise, check if this tile needs to be painted
	{
		if (PaintTile==false) // see if we should 
		{
			// If this tile has a high enough resolution, just paint it
			if ((typeof(CM3View)!="undefined")&&(TheView instanceof CM3View))
			{
				var Distance=CMTile.GetDistanceTo3DView(TheView,this.GetTileExtentAsGeographic(TheLayer),TheLayer);
				
				if (Distance>ThisStepTileRefWidth*3) PaintTile=true;
//				PaintTile=true; // have to determine distance from View to Tile
			}
			else // see if we are zoomed out enough that this tile's resolution is good enough
			{
				var ThisStepsTilePixelWidth=TheView.GetPixelWidthFromRefWidth(ThisStepTileRefWidth);
	
				if (ThisStepsTilePixelWidth<=256) PaintTile=true; // resolution is low, paint this tile
			}
			// If there are no children, paint this tile
			if (this.ChildTiles==null)  PaintTile=true; // tile has no children, paint this tile
			
			// If we're not going to paint this tile, check to see if we should paint, or load, the child tiles
			if (PaintTile==false) // see if we have 4 child tiles ready to be painted (or are empty)
			{
				if (this.TheData.NumChildTiles>0) // this tile does have child tiles
				{
					NumLoadedChildTiles=0;
					
					// go through the 4 child tiles
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0) // if th
							{
								var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];

								if (TheChildTile.LoadStatus==CMDataset.LOAD_STATUS_NONE) 
								{
									// tile child tile has not been loaded, load it now for the next repaint
									TheChildTile.LoadTile(TheView);
									// have to paint this tile
									PaintTile=true;
								}
								else if (TheChildTile.LoadStatus==CMDataset.LOAD_STATUS_LOADING)
								{
									// cihld tile has not finished loading, have to paint this tile
									PaintTile=true;
								}
								else 
								{
									// 
									if ("Features" in this.TheData) // vector data
									{
										NumLoadedChildTiles++;
									}
									else if ("FillColor" in this.TheData) // 
									{
										NumLoadedChildTiles++; // just a color
									}
									else if ("RasterExtension" in this.TheData) //raster data
									{
										if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
										{
											NumLoadedChildTiles++;
										}
										else if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_CANCELED)
										{
											this.LoadTileRaster(".png");
										}
									}
									else if ("NumClusters" in this.TheData)
									{
										NumLoadedChildTiles++;
									}
									else if ("RasterData" in this.TheData)
									{
										NumLoadedChildTiles++;
									}
								}
							}
							else if (this.TheData.ChildTiles[RowIndex][ColumnIndex]==0) // empty tile
							{
								NumLoadedChildTiles++;
							}
						}
					}
					// unless this tile is completely covered by child tiles, paint it	
					if (NumLoadedChildTiles<4) PaintTile=true;
				}
			}
		}
	}
	return(PaintTile);
}


//******************************************************************
// Public CMTile functions
//******************************************************************

/**
* Override the function for obtaining tiles.
* Create a single image tile and attempt to load it.
* Called by CMTile and by the CMDatasetPyramid.
* @public
*/
CMTile.prototype.LoadTile=function() 
{
	var FileName="Tiles_"+this.ZoomLevel+"/"+(this.GlobalColumn)+"/"+(this.GlobalRow)+".js";
	
	var URL=this.TheDataset.URL+FileName;

	var TheRequest=new XMLHttpRequest();
	
	this.TheRequest=TheRequest;
	
	TheRequest.open("GET",URL,true);
	//TheRequest.TheView=TheView;
	TheRequest.TheURL=URL;
	TheRequest.TheDataset=this.TheDataset;
	TheRequest.TheTile=this;
	TheRequest.FileName=FileName;
	
	this.LoadStatus=CMDataset.LOAD_STATUS_LOADING;
	
	TheRequest.onreadystatechange=function() 
	{
		if( this.readyState == 4)  // done
		{
//			alert("status="+this.status);
			if( this.status == 200) // OK
			{
				// get the response text and parse it (text contains the information for the tile)
				
				var TheText=this.responseText;

				var TheGeoJSONObject=JSON.parse(TheText);
			
				// setup the tile with the specified data
				
				var TheTile=this.TheTile; // get the tile just to make the code more readable
				
				CMTile.NumTilesLoaded++; // keep track of the total number of tiles loaded
				
				TheTile.TheData=TheGeoJSONObject; // gset the data from the server into the tile
				
				// we are now loaded and ready to be painted
				
				TheTile.LoadStatus=CMDataset.LOAD_STATUS_LOADED;

				if ("RasterExtension" in TheTile.TheData) // raster data
				{
					TheTile.LoadTileRaster(".png"); // try to immeidately load the raster
				}
				if ("RasterData" in TheTile.TheData) // raster data
				{
					TheTile.DatasetRaster=new CMDatasetRaster();
					
					var MaxPixelValues=this.TheDataset.MaxPixelValues;
					var MinPixelValues=this.TheDataset.MinPixelValues;
					
					TheTile.TheData.RasterData.MaxPixelValues=MaxPixelValues;
					TheTile.TheData.RasterData.MinPixelValues=MinPixelValues;
					
					TheTile.DatasetRaster.SetData(TheTile.TheData.RasterData);
				}
				//***********************************************************************************
				// create the children, if any
				
				if (TheTile.TheData.NumChildTiles>0) // tile has children
				{
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							// negative for one feature ID, >0 for mulitple and must load a child tile
							if (TheTile.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
							{
								if (TheTile.ChildTiles==null) // initialize the array
								{
									TheTile.ChildTiles=[];
									TheTile.ChildTiles[0]=[null,null];
									TheTile.ChildTiles[1]=[null,null];
								}
								
								var ChildZoomLevel=TheTile.ZoomLevel+1;
								var ChildColumn=(TheTile.GlobalColumn*2)+ColumnIndex;
								var ChildRow=(TheTile.GlobalRow*2)+(1-RowIndex);
								
								// create the tile, loads are initiated on paint
								var TheChildTile=new CMTile(this.TheDataset,ChildZoomLevel,ChildColumn,ChildRow);
								
								if (this.PaintTileInfo) TheChildTile.SetPaintTileInfo(this.PaintTileInfo);
								
								TheTile.ChildTiles[RowIndex][ColumnIndex]=TheChildTile;
							}
						}
					}
				}
				// zoom to bounds if desired and repaint
				
				TheTile.TheDataset.SendMessageToListeners(CMDataset.MESSAGE_DATASET_TILE_LOADED,TheTile);
				
				//if (this.OnLoadFunction!=undefined) this.OnLoadFunction(TheTile,this.TheView);
				
/*				if (this.ZoomToBounds)
				{
					this.TheView.ZoomToBounds(this.TheDataset.GetBounds());
				}
				this.TheDataset.GetParent(CMScene).Repaint(); 
*/			}
			else alert("HTTP error "+this.status+" "+this.statusText+" ("+this.TheURL+")");
		}
	}
	TheRequest.send();
}

//***********************************************************************
// Public CMTile functions
//***********************************************************************
/**
* Paint a single tile.  Adds appropriate content to the Geo based on the content type.
* @public
*/
CMTile.prototype.PaintTile=function(TheLayer,TheView,SelectedOnly,ThisStepTileRefWidth) 
{
	var NumPainted=0; // 1 if this tile painted it's contents, 0 otherwise
		
	var TileRefWidth=ThisStepTileRefWidth;
	var RefX=(this.GlobalColumn*TileRefWidth);
	var RefY=(this.GlobalRow*TileRefWidth);
	
	var Extent=this.GetTileExtent(TheLayer);
	
	var PaintTile=true; // true to paint this tile, false to paint children
	
	// check for 3D
	if ((typeof(CM3View)!="undefined")&&(TheView instanceof CM3View)) // have a 3d view
	{
		if ((TheLayer.GetVisible())&&(this.TheData!=null))
		{
			// jjg - cheating a bit here and finding the disance from one corner of the tile
			// to the other corner (should do this in the projector where arc disances can be computed)
			
			var TileRefWidth2=this.GetTileWidthAsGlobal(TheLayer);
			
			PaintTile=this.CheckPaintTile(TheLayer,TheView,TileRefWidth2);
			
			if (PaintTile) // painting this tile
			{
				//*************************************************************************
				// paint a raster from a raster file (e.g. PNG or JPG)
				if ("RasterExtension" in this.TheData)  // raster file
				{
					if (this.MeshIsInGeo==false) // the mesh is not in the Geo, we need to add it
					{
						if (this.TheMesh==null) // the mesh is not available, we need to create it
						{
							if (TheLayer instanceof CM3LayerTerrain) // try to get the DEM info
							{
								var DEMDataset=TheLayer.GetDEMDataset();
								var Exaggeration=TheLayer.GetSetting("Elevation","Exaggeration",1);
								
								var TheMatrixes=DEMDataset.GetDataForTextureTile(TheView,this,Exaggeration,TheLayer);
								
								if (TheMatrixes!=null)
								{
									var TheArray=TheMatrixes[0];
									var TheMask=TheMatrixes[1];
									
									//  
									var NumColumns=TheArray[0].length;
									var NumRows=TheArray.length;
									
									var TheGeometry=new CM3SurfaceGeometry(NumColumns-1,NumRows-1,TheMask);
									
									TheGeometry.SetPositions(TheArray);
									
									// setup the material
									var TheFileName=this.GetTileImageFilePath();
									
									// setup the material
									var SolidColorMaterial=CMTile.GetNewMaterial(TheFileName);
								
									// setup the mesh
									this.TheMesh=new THREE.Mesh(TheGeometry,SolidColorMaterial);
								}
							}
							else // regular layer without terrain
							{
								var TheFileName=this.GetTileImageFilePath(); // first for debugging
								
								// try to get the DEM info
								var TheGeometry=this.SetupGeometry(TheLayer);
								
								// setup the material
								var SolidColorMaterial=CMTile.GetNewMaterial(TheFileName);
							
								// setup the mesh
								this.TheMesh=new THREE.Mesh(TheGeometry,SolidColorMaterial);
							}
							
						}
						// add the mesh to the geo
						
						if (this.TheMesh!=null)
						{
							var TheGeo=TheLayer.GetParent(CMGeo);
							TheGeo.AddOGLObject(this.TheMesh);
							
//							var helper = new THREE.VertexNormalsHelper( this.TheMesh, 20, 0x00ff00, 10 );
//							helper.rotateX(-Math.PI/2);							
//							TheGeo.AddOGLObject(helper);
							
							this.MeshIsInGeo=true;
						}
					}
				}
			}
			// 
			if (PaintTile==false) // remove this tile from the Geo, if needed, and paint the children
			{
				if (this.MeshIsInGeo) // need to remove this tile from mesh
				{
					var TheGeo=TheLayer.GetParent(CMGeo);
					TheGeo.RemoveOGLObject(this.TheMesh);
					this.MeshIsInGeo=false;
				}
			}
		}
	}
	else if(CMUtilities.BoundsOverlap(Extent,TheView.GetBounds()))
	{
		if ((this.TheData!=null)) // data will be null until recieved
		{
			var TileRefLeft=RefX
			var TileRefRight=RefX+TileRefWidth;
			var TileRefTop=RefY+TileRefWidth;
			var TileRefBottom=RefY;
			
			// paint the child
			
			PaintTile=this.CheckPaintTile(TheLayer,TheView,ThisStepTileRefWidth);
			
			var NumChildrenPainted=0;
			if (PaintTile) // paint this tile instead of the children
			{
				//*************************************************************************
				// vector data
				if (("Features" in this.TheData)) // vector data 
				{
					if ((this.ZoomLevel==4)&&(this.GlobalColumn==11)&&(this.GlobalRow==3))
					{
						var j=12;
					}
					// Get the features from the data
					var TheFeatures=this.TheData.Features;
				
					// setup the PaintedEdges array
					var PaintedEdges=null;
					var TheEdges=this.TheData.Edges;
/*					if (this.TheData.Edges!=undefined)
					{
						var TheEdges=this.TheData.Edges;
						
						for (var j=0;j<TheEdges.length;j++) PaintedEdges[j]=false;
					}
*/					
					// draw each feature in this tile
					for (var i=0; i < TheFeatures.length; i++) 
					{
						var ViewBounds=TheView.GetBounds();
						
			//			if (CMUtilities.BoundsOverlap(ViewBounds,this.FeatureBounds[i]))
						{
							var TheFeature=TheFeatures[i];
							
							var TheAreas=TheFeature.Areas;
							
							for (var AreaIndex=0;AreaIndex<TheAreas.length;AreaIndex++)
							{
								var TheArea=TheAreas[AreaIndex];
								
								//var TheEdges=TheArea.Edges;
								var ThePolys=TheArea.Polys;
								
								for (var PolyIndex=0;PolyIndex<ThePolys.length;PolyIndex++)
								{
									var ThePoly=ThePolys[PolyIndex];
									
									if (ThePoly.Closed)
									{
										var PolygonCoordinates=this.GetPolygonCoordinates(TheEdges,TheArea,PolyIndex,PaintedEdges);
										
										if (PolygonCoordinates.Xs.length>2)
										{
											var Poly=[PolygonCoordinates.Xs,PolygonCoordinates.Ys];
											var AreaCoordinates=[Poly];
											
											var TheType=CMDatasetVector.TYPE_POLYLINES;
											if (ThePolys[PolyIndex].Closed) TheType=CMDatasetVector.TYPE_POLYGONS;
											
											TheLayer.PaintRefArea(TheView,i,AreaCoordinates,TheType,false,false);
										}
									}
									// painting edges here and below
//									TheView.PaintRefPoly(PolygonCoordinates.Xs,PolygonCoordinates.Ys,ThePolys[PolyIndex].Closed,false);
								}
							} // for AreaIndex
						}
					} // for i<TheFeatures.length
					
					// paint the edges
					if (TheEdges!=undefined) // happens when we have features that surround the tile
					{
						for (var EdgeIndex=0;EdgeIndex<TheEdges.length;EdgeIndex++)
						{
	//						if (PaintedEdges[EdgeIndex]==false)
							{
								var Xs=TheEdges[EdgeIndex].Xs;
								var Ys=TheEdges[EdgeIndex].Ys;
								
								if (Xs.length>2)
								{
									var Poly=[Xs,Ys];
									var AreaCoordinates=[Poly];
									
									TheLayer.PaintRefArea(TheView,i,AreaCoordinates,CMDatasetVector.TYPE_POLYLINES,false,false)
								}
							}
						}
					}
				}
				//*************************************************************************
				// paint a raster from a raster file (e.g. PNG or JPG)
				if ("RasterExtension" in this.TheData)  // raster file
				{
					if (this.TheRasterRequest!=null)
					{
						if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_LOADED)
						{
							var ImageRefWidth=TileRefWidth;
							var ImageRefHeight=-TileRefWidth;
							
							var ImageRefX=RefX;
							var ImageRefY=RefY+TileRefWidth;
							
							//console.log("Painting tile: Zoom: "+this.ZoomLevel+" ("+this.GlobalColumn+","+this.GlobalRow+")");

							TheView.PaintRefImageScaled(this.TheRaster,ImageRefX,ImageRefY,ImageRefWidth,ImageRefHeight);
						}
						else if (this.TheRasterRequest.LoadStatus==CMDataset.LOAD_STATUS_CANCELED)
						{
							this.LoadTileRaster();
						}
					}
				}
				//*************************************************************************
				// just fill in the raster
				if ("FillColor" in this.TheData) // just paint the color
				{
					var TheColor=this.TheData.TheColor;
				
					if (TheColor!==null)
					{
						var Test="rgb("+TheColor[0]+","+TheColor[1]+","+TheColor[2]+")";
						
						var TheStyle2={
							"fillStyle":""+Test+"",
							"lineWidth":0
						};
						if (TheStyle2!=null) TheView.SetStyle(TheStyle2);
						
						TheView.PaintRefBounds(Extent);
						
						if (TheStyle2!=null) TheView.RestoreStyle();
					}
				}
				//*************************************************************************
				// raster data in text form
				if ("RasterData" in this.TheData) // raster data
				{
					this.DatasetRaster.Paint(TheView);
				}
				//*************************************************************************
				// clustered point data
				if ("NumClusters" in this.TheData)
				{
					var NumClusters=this.TheData.NumClusters;
					var ClusterCoordinates=this.TheData.ClusterCoordinates;
					
					for (var i=0;(i <NumClusters); i++) 
					{
						var X=ClusterCoordinates[0][i];
						var Y=ClusterCoordinates[1][i];
						
						TheView.PaintRefCircle(X,Y,10);
					}
				}
			}
		}
	}
	// if nothing was painted above and we have data, try to paint the children
	if (this.TheData!=null) // data will be null until recieved
	{
		if (PaintTile) // 
		{
			//*************************************************************************
			// paint the debugging information
			
			if ((this.PaintTileInfo))
			{
				var TheStyle2={
					"font":"20px Arial",
					"fillStyle":"red",
					"lineWidth":1,
					"strokeColor": "red",
					"strokeStyle":"#000",
				};
				if (TheStyle2!=null) TheView.SetStyle(TheStyle2);
					
				var CenterX=RefX+TileRefWidth/2;
				var CenterY=RefY+TileRefWidth/2;
				
				var TheText=this.ZoomLevel+"_"+this.GlobalColumn+"_"+this.GlobalRow;
				
				TheView.PaintRefText(TheText,CenterX,CenterY,20);
				
				TheView.PaintRefLine(RefX,RefY,RefX,RefY+TileRefWidth); // left
				TheView.PaintRefLine(RefX+TileRefWidth,RefY,RefX+TileRefWidth,RefY+TileRefWidth); // right
				
				TheView.PaintRefLine(RefX,RefY,RefX+TileRefWidth,RefY); // top 
				TheView.PaintRefLine(RefX,RefY+TileRefWidth,RefX+TileRefWidth,RefY+TileRefWidth); // bottom
				
				if (TheStyle2!=null) TheView.RestoreStyle();
			}
		}
		if (PaintTile==false) // paint the child tiles in this tile
		{
			if (this.TheData.NumChildTiles>0)
			{
				for (var RowIndex=0;RowIndex<2;RowIndex++)
				{
					for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
					{
						// negative for one feature ID, >0 for mulitple and must load a child tile
						
						if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
						{
							var TheChildTile=this.ChildTiles[RowIndex][ColumnIndex];
							
							// the tiles in the next step are 1/2 the reference width of the tiles in this step
							
							var NextStepTileRefWidth=ThisStepTileRefWidth/2;
							
							NumChildrenPainted+=TheChildTile.PaintTile(TheLayer,TheView,SelectedOnly,NextStepTileRefWidth);
						}
					}
				}
			}
		}
		NumPainted++;
		
		// if the children of this tile painted, we do not need to paint
		
		if (NumChildrenPainted<4)
		{
			var Test=12;
		}
	}
	
	return(NumPainted);
}
//******************************************************************
// Public CMItem functions
//******************************************************************
/**
* Adds this tile to the specific boundary. Called by CMDatasetPyramid 
* @public
*/
CMTile.prototype.AddToFeatureBounds=function(FeatureIndex,Bounds) 
{
	if ("Features" in this.TheData) // vector data
	{
		var TheFeatures=this.TheData.Features;
		var TheEdges=this.TheData.TheEdges;
		
		var Found=false;
		for (var i=0;(i < TheFeatures.length)&&(Found==false); i++) 
		{
			var TheFeature=TheFeatures[i];
			
			if (TheFeature.LayerFeatureIndex==FeatureIndex)
			{
				Found=true;
				
				var TheAreas=TheFeature.Areas;
				
				for (var AreaIndex=0;(AreaIndex<TheAreas.length);AreaIndex++)
				{
					var TheArea=TheAreas[AreaIndex];
					
					var ThePolys=TheArea.Polys;
					
					for (var PolyIndex=0;(PolyIndex<ThePolys.length);PolyIndex++)
					{
						var PolygonCoordinates=this.GetPolygonCoordinates(TheEdges,TheArea,PolyIndex,null);
					
						var PolygonBounds=CMUtilities.GetPolygonBounds(PolygonCoordinates.Xs,
							PolygonCoordinates.Ys,PolygonCoordinates.Xs.length);
						
						Bounds=CMUtilities.AddToBounds(Bounds,PolygonBounds);
					}
				}
			}
		}
	}
	if ("NumClusters" in this.TheData) // point data
	{
		var NumClusters=this.TheData.NumClusters;
		var ClusterCoordinates=this.TheData.ClusterCoordinates;
		
		for (var i=0;(i <NumClusters)&&(Found==false); i++) 
		{
			var X=ClusterCoordinates[0][i];
			var Y=ClusterCoordinates[1][i];
			
			var PointBounds={
				XMax:X,
				XMin:X,
				YMax:Y,
				YMin:Y
			};
			
			Bounds=CMUtilities.AddToBounds(Bounds,PointBounds);
		}
	}
 	return(Bounds);
};

//******************************************************************
// Public CMItem Event Functions
//******************************************************************
CMTile.prototype.In=function(TheView,RefX,RefY,RefTolerance) 
{
	var FeatureIndex=-1;
	
	if ((this.TheData!=null)&&("Features" in this.TheData)) // have vector data
	{
		var ViewBounds=TheView.GetBounds();
	
		var Extent=this.GetTileExtent(TheLayer);
		
		var ExpandedExtent=CMUtilities.CloneBounds(Extent);
		
		CMUtilities.ExpandBounds(ExpandedExtent,RefTolerance);
		
		if ((CMUtilities.BoundsOverlap(ViewBounds,ExpandedExtent)))
		{
			var TheFeatures=this.TheData.Features;
			var TheEdges=this.TheData.Edges;
			for (var i=0;(i < TheFeatures.length)&&(FeatureIndex==-1); i++) 
			{
				
	//			if (CMUtilities.BoundsOverlap(ViewBounds,this.FeatureBounds[i]))
				{
					var TheFeature=TheFeatures[i];
					
					var TheAreas=TheFeature.Areas;
					
					for (var AreaIndex=0;(AreaIndex<TheAreas.length)&&(FeatureIndex==-1);AreaIndex++)
					{
						var TheArea=TheAreas[AreaIndex];
						
						var ThePolys=TheArea.Polys;
						
						for (var PolyIndex=0;(PolyIndex<ThePolys.length)&&(FeatureIndex==-1);PolyIndex++)
						{
							var ThePoly=TheArea.Polys[PolyIndex];
							
							var PolygonCoordinates=this.GetPolygonCoordinates(TheEdges,TheArea,PolyIndex,null);
						
							var Inside=false;
							
							if (ThePoly.Closed)
							{
								Inside=CMUtilities.InsideAPolygon(RefX,RefY,PolygonCoordinates.Xs,PolygonCoordinates.Ys,PolygonCoordinates.Xs.length);
							}
							else
							{
								//var Tolerance=TheView.GetRefWidthFromPixelWidth(6); // jjg= tolerance needs to be passed in 
								Inside=CMUtilities.InPolyline(RefX,RefY,PolygonCoordinates.Xs,PolygonCoordinates.Ys,RefTolerance);
							}
							if (Inside) 
							{
								FeatureIndex=TheFeature.LayerFeatureIndex;
							}
						}
					}
				}
			}
			if (FeatureIndex==-1) // check with loaded children
			{
				if (this.TheData.NumChildTiles>0)
				{
					for (var RowIndex=0;RowIndex<2;RowIndex++)
					{
						for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
						{
							if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
							{
								//FeatureIndex=this.ChildTiles[RowIndex][ColumnIndex].In(TheView,RefX,RefY,RefTolerance);
							}
						}
					}
				}
			}
		}
	}
	return(FeatureIndex);
};
CMTile.prototype.MouseDown=function(TheView,RefX,RefY,RefTolerance) 
{
	var Used=false;
	
	if ((this.TheData!=null)&&
		 ((TheView.GetTool()==CMView.TOOL_INFO)||(TheView.GetTool()==CMView.TOOL_SELECT)))
	{
		if (("Features" in this.TheData)||("NumClusters" in this.TheData)) // vector data
		{
			var FeatureIndex=this.In(TheView,RefX,RefY,RefTolerance);
			
			if (FeatureIndex!=-1)
			{
				this.TheDataset.ShowInfoWindow(FeatureIndex,TheView,RefX,RefY);
		
				Used=true;
			}
			else // call children?
			{
			}
		}
		else if (("RasterExtension" in this.TheData)) // raster data
		{
			if (this.TheRaster!=null)
			{
				var Factor=Math.pow(2,this.ZoomLevel);
				var TileRefWidth=this.TheDataset.TileRefWidth/Factor;
				
				var TileRefX=(this.GlobalColumn*TileRefWidth);
				var TileRefY=(this.GlobalRow*TileRefWidth);
				
				var PixelX=parseInt((RefX-TileRefX)/TileRefWidth*256);
				var PixelY=parseInt((TileRefY-RefY)/TileRefWidth*256);
				
				if ((PixelX>=0)&&(PixelX<256)&&(PixelY>=0)&&(PixelY<256)) // in tile
				{
					var TheHTML="Pixel X:"+PixelX+" Y: "+PixelY;
				
					var Index=PixelY*(256*3)+(PixelX*3);
					
					// 
					
					 var canvas = document.createElement("canvas");
					canvas.width = this.TheRaster.width;
					canvas.height =  this.TheRaster.height;
					
					// Copy the image contents to the canvas
					var ctx = canvas.getContext("2d");
					ctx.drawImage( this.TheRaster, 0, 0);
					
					var ImageData=ctx.getImageData(PixelX,PixelY,1,1);
					
					TheHTML+=" Value:"+ImageData.data[0]+","+ImageData.data[1]+","+ImageData.data[2];
					
					var InfoWindow=TheView.CreateInfoWindow("CMTile.InfoWindow",RefX,RefY,200,30,TheHTML);
				
					CMMainContainer.SetPopupWindow(InfoWindow);
					
					Used=true;
				}
			}
		}
		//
		if (Used==false)
		{
			if (this.TheData.NumChildTiles>0)
			{
				for (var RowIndex=0;RowIndex<2;RowIndex++)
				{
					for (var ColumnIndex=0;ColumnIndex<2;ColumnIndex++)
					{
						if (this.TheData.ChildTiles[RowIndex][ColumnIndex]>0)
						{
							Used=this.ChildTiles[RowIndex][ColumnIndex].MouseDown(TheView,RefX,RefY,RefTolerance);
						}
					}
				}
			}
		}
	}
	return(Used);
};


//******************************************************************
// Public CMTile Get/Set functions 
//******************************************************************
/**
* Sets whether the tile will paint it's debugging information.
* The parent dataset has a setting for this.
* @public
*/
CMTile.prototype.SetPaintTileInfo=function(NewPaintTileInfo) 
{
	this.PaintTileInfo=NewPaintTileInfo;
}

//CanvasMap/js/CMUtilityBezier.js
/******************************************************************************************************************
* CMUtilityBezier
* Utilities for creating Bezier curves.
*
* @module CMUtilityBezier
* @Copyright HSU, Jim Graham, 2019
******************************************************************************************************************/
//****************************************************************************************************
// Constructor 
//****************************************************************************************************
function CMUtilityBezier() 
{
	
}

//****************************************************************************************************
// Definitions
//****************************************************************************************************
/**
 * Renders a Bezier curve from P0 that does not have a specified slope
 * to P1 that has a slope specified by P0 and P2.  P2 is not part of this
 * curve but is the next curve.
 * 
 * Not currently used.
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param X2 Additional point to compute the slope at the second point 
 * @param Y2 (this point is on the next segment of the curve, not part of the current curve).
 * @param Z2
 * @return 
 */
CMUtilityBezier.GetThreePoint3D=function(NumSteps,X0,Y0,Z0,X1,Y1,Z1,X2,Y2,Z2)
{
	var DX1,DY1,DZ1;

	// Find the slope at X1,Y1

	DX1=(X2-X0)/2;
	DY1=(Y2-Y0)/2;
	DZ1=(Z2-Z0)/2;
	
	var Result=CMUtilityBezier.GetOneSlope3D(NumSteps,X0,Y0,Z0,X1,Y1,Z1,DX1,DY1,DZ1);
	
	return(Result);
}

/**
 * Computes a Bezier curuve using 2 points (in 3D) amd a slope at the second point.
 * 
 * Used by STBOS (Bezier surface)
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param DX1 Slope at second point
 * @param DZ1
 * @return 
 */
CMUtilityBezier.GetOneSlope3D=function(NumSteps,X0,Y0,Z0,X1,Y1,Z1,DX1,DY1,DZ1)
{
	var AX,BX,CX;
	var AY,BY,CY;
	var AZ,BZ,CZ;
	//

	var NumPoints=NumSteps-1;

	var  Result=[];

	Result[0]=[NumPoints];
	Result[1]=[NumPoints];
	Result[2]=[NumPoints];

	// find the factors

	DX1=-DX1;
	DY1=-DY1;
	DZ1=-DZ1;

	AX=X0-DX1-X1;
	BX=DX1;
	CX=X1;

	AY=Y0-DY1-Y1;
	BY=DY1;
	CY=Y1;

	AZ=Z0-DZ1-Z1;
	BZ=DZ1;
	CZ=Z1;

	// draw the curve

	var x2,y2,z2;
	var t;
	var t2;

	var Index=0;
	for (var i=1;i<NumSteps;i++) // 1 to NumSteps-1 (one less point than there are steps (i.e. 9 points for 10 steps)
	{
		t=1.0-i/NumSteps;

		t2=t*t;

		x2=(AX*t2)+(BX*t)+CX;
		y2=(AY*t2)+(BY*t)+CY;
		z2=(AZ*t2)+(BZ*t)+CZ;

		Result[0][Index]=x2;
		Result[1][Index]=y2;
		Result[2][Index]=z2;
		Index++;
	}

	return(Result);
}
/**
 * Creates a standard Bezier curve from 4 points in 2 space (x,y).
 * 
 * Used by STBezierUtil.GetBezier() and STLayerGraticules
 * 
 * @param NumSteps
 * @param X0 - Point before the curve to compute the slope at the first point (not on the curve)
 * @param Y0
 * @param X1 - Starting point (on the curve and used to determine the slope at the next point)
 * @param Y1
 * @param X2 - Ending point (slope is calculated for this point)
 * @param Y2
 * @param X3 - Additional point to compute the slope at the second point (not on the curve)
 * @param Y3
 * @return 
 */
CMUtilityBezier.GetFourPoint3D=function(NumSteps,X0,Y0,Z0,X1,Y1,Z1,X2,Y2,Z2,X3,Y3,Z3)
{
	var DX1,DY1,DZ1;
	var DX2,DY2,DZ2;

	// Find the slope at X1,Y1

	DX1=(X2-X0)/2;
	DY1=(Y2-Y0)/2;
	DZ1=(Z2-Z0)/2;

	// Find the slope at X2,Y2

	DX2=(X3-X1)/2;
	DY2=(Y3-Y1)/2;
	DZ2=(Z3-Z1)/2;

	var  Result=CMUtilityBezier.GetTwoSlope3D(NumSteps,X1,Y1,Z1,X2,Y2,Z2,DX1,DY1,DZ1,DX2,DY2,DZ2);
	
	return(Result);
}
	
/**
 * Computes a Bezier curuve using 2 points (in 3D) amd slopes at each point.
 * 
 * Used by SBezierUtil.GetSecondOrderPoints() above.
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param DX1 Slope at first point
 * @param DZ1
 * @param DX2 Slope at second point
 * @param DZ2
 * @return 
 */
CMUtilityBezier.GetTwoSlope3D=function(NumSteps,X1,Y1,Z1,X2,Y2,Z2,DX1,DY1,DZ1,DX2,DY2,DZ2)
{
	var NumPoints=NumSteps-1;

	var Result=[];

	Result[0]=[NumPoints];
	Result[1]=[NumPoints];
	Result[2]=[NumPoints];

	// find the factors

	var AX,BX,CX,DX;
	var AY,BY,CY,DY;
	var AZ,BZ,CZ,DZ;

	AX=2*(X1-X2)+DX1+DX2;
	BX=3*(X2-X1)-2*DX1-DX2;
	CX=DX1;
	DX=X1;

	AY=2*(Y1-Y2)+DY1+DY2;
	BY=3*(Y2-Y1)-2*DY1-DY2;
	CY=DY1;
	DY=Y1;

	AZ=2*(Z1-Z2)+DZ1+DZ2;
	BZ=3*(Z2-Z1)-2*DZ1-DZ2;
	CZ=DZ1;
	DZ=Z1;

	// draw the first curve

	var x1,y1,z1;
	var x2,y2,z2;
	var t;
	var t2;
	var t3;

	var Index=0;
	for (var i=1;i<NumSteps;i++)
	{
		t=i/NumSteps;

		t2=t*t;
		t3=t2*t;

		x2=(AX*t3)+(BX*t2)+CX*t+DX;
		y2=(AY*t3)+(BY*t2)+CY*t+DY;
		z2=(AZ*t3)+(BZ*t2)+CZ*t+DZ;

		Result[0][Index]=x2;
		Result[1][Index]=y2;
		Result[2][Index]=z2;
		
		Index++;
	}

	return(Result);
}
//****************************************************************************************************
// 2D functions
//****************************************************************************************************
/**
 * Creates a standard Bezier curve from 4 points in 2 space (x,y).
 * 
 * Used by STBezierUtil.GetBezier() and STLayerGraticules
 * 
 * @param NumSteps
 * @param X0 - Point before the curve to compute the slope at the first point (not on the curve)
 * @param Y0
 * @param X1 - Starting point (on the curve and used to determine the slope at the next point)
 * @param Y1
 * @param X2 - Ending point (slope is calculated for this point)
 * @param Y2
 * @param X3 - Additional point to compute the slope at the second point (not on the curve)
 * @param Y3
 * @return 
 */
CMUtilityBezier.GetFourPoint2D=function(NumSteps,X0,Y0,X1,Y1,X2,Y2,X3,Y3)
{
	var DX1,DY1;
	var DX2,DY2;

	// Find the slope at X1,Y1

	DX1=(X2-X0)/2;
	DY1=(Y2-Y0)/2;

	// Find the slope at X2,Y2

	DX2=(X3-X1)/2;
	DY2=(Y3-Y1)/2;

	var  Result=CMUtilityBezier.GetTwoSlope2D(NumSteps,X1,Y1, X2,Y2,DX1,DY1,DX2,DY2);
	
	return(Result);
}
	
/**
 * Computes a Bezier curuve using 2 points (in 3D) amd slopes at each point.
 * 
 * Used by SBezierUtil.GetSecondOrderPoints() above.
 * 
 * @param NumSteps
 * @param X0 Starting point (on the curve and used to determine the slope at the next point)
 * @param Y0
 * @param Z0
 * @param X1 Ending point (slope is calculated for this point)
 * @param Y1
 * @param Z1
 * @param DX1 Slope at first point
 * @param DZ1
 * @param DX2 Slope at second point
 * @param DZ2
 * @return 
 */
CMUtilityBezier.GetTwoSlope2D=function(NumSteps,X1,Y1,X2,Y2,DX1,DY1,DX2,DY2)
{
	//

	var NumPoints=NumSteps-1;

	var Result=[];

	Result[0]=[NumPoints];
	Result[1]=[NumPoints];

	// find the factors

	var AX,BX,CX,DX;
	var AY,BY,CY,DY;

	AX=2*(X1-X2)+DX1+DX2;
	BX=3*(X2-X1)-2*DX1-DX2;
	CX=DX1;
	DX=X1;

	AY=2*(Y1-Y2)+DY1+DY2;
	BY=3*(Y2-Y1)-2*DY1-DY2;
	CY=DY1;
	DY=Y1;

	// draw the first curve

	var x1,y1;
	var x2,y2;
	var t;
	var t2;
	var t3;

	var Index=0;
	for (var i=1;i<NumSteps;i++)
	{
		t=i/NumSteps;

		t2=t*t;
		t3=t2*t;

		x2=(AX*t3)+(BX*t2)+CX*t+DX;
		y2=(AY*t3)+(BY*t2)+CY*t+DY;

		Result[0][Index]=x2;
		Result[1][Index]=y2;
		Index++;
	}

	return(Result);
}
//****************************************************************************************************
// Higher-level functions to return curves with width
//****************************************************************************************************
/**
* Sets up the Bezier curves
* @private
*/
CMUtilityBezier.GetBezierOutline=function(Xs,Ys,Closed,Smoothing)
{
	//**************************************
	// setup the return values
	var X1s=null;
	var Y1s=null;
	
	// get the segments
	if (Xs.length<=1) // one point,do nothing
	{
	}
	else if (Xs.length==2) // straight line
	{
		X1s=[Xs[0],Xs[1]];
		Y1s=[Ys[0],Ys[1]];
	}
	else // Bezier curves
	{
		var NumPoints=Xs.length;
		
		var NumCurves=Xs.length;
		if (Closed==false) NumCurves=Xs.length-1;
		
		// add the first point to the coordinate arrays
		X1s=[Xs[0]];
		Y1s=[Ys[0]];
		
		// start at the start point
		
		for (var Curve=0;Curve<NumCurves;Curve++)
		{
			// for each curve, add the additional points to the end of the curve (which is the start of the next curve)
			
			//*************************************************
			// find the start and end points
			var StartPoint=Curve;
			var EndPoint=Curve+1;
			
			if (EndPoint==Xs.length) EndPoint=0; // wraps around
			
			//*************************************************
			// find the smoothing factors
			var StartSmooth=false;
			
			if (Smoothing!=null)
			{
				if ((Curve!=0)||(Closed)) StartSmooth=Smoothing[StartPoint]; // allow smoothing once past first point or if closed
				
				var EndSmooth=false;
				if ((Curve+1<NumPoints-1)||(Closed)) EndSmooth=Smoothing[EndPoint]; // not at the end
			}
			//*****************************************************
			var PreviousPoint=StartPoint-1;
			if (PreviousPoint<0) PreviousPoint=Xs.length-1; // wrap back to last point
			
			var NextPoint=EndPoint+1;
			if (NextPoint==Xs.length) NextPoint=0;
			
			//*****************************************************
			if (StartSmooth==false) // start sharp, draw a 3rd order Bezier or straight line
			{
				if (EndSmooth==false) // start sharp and end sharp, draw straight line
				{
					X1s.push(Xs[EndPoint]);
					Y1s.push(Ys[EndPoint]);
				}
				else // start sharp and end smooth, 3rd order Bezier 
				{
					var Points=CMUtilityBezier.GetThreePoint3D(10,Xs[StartPoint],Ys[StartPoint],0,
						Xs[EndPoint],Ys[EndPoint],0,Xs[NextPoint],Ys[NextPoint],0);
					
					for (var i=0;i<Points[0].length;i++)
					{
						X1s.push(Points[0][i]);
						Y1s.push(Points[1][i]);
					}
					X1s.push(Xs[EndPoint]);
					Y1s.push(Ys[EndPoint]);
					//this.DrawCurve(TheView,Xs,Ys,Points,0,1,X1s,Y1s);
				}
			}
			else // start smooth, draw a 3rd order or 4th order Bezier 
			{
				if (EndSmooth) // both smooth, draw a 4th order Bezier
				{
					var Points=CMUtilityBezier.GetFourPoint2D(10,Xs[PreviousPoint],Ys[PreviousPoint],
							Xs[StartPoint],Ys[StartPoint],Xs[EndPoint],Ys[EndPoint],
							Xs[NextPoint],Ys[NextPoint]);
					
					for (var i=0;i<Points[0].length;i++)
					{
						X1s.push(Points[0][i]);
						Y1s.push(Points[1][i]);
					}
					X1s.push(Xs[EndPoint]);
					Y1s.push(Ys[EndPoint]);
				}
				else // start smooth, end sharp
				{
					var LastPoint=Xs.length-1;
					
					var Points=CMUtilityBezier.GetThreePoint3D(10,Xs[EndPoint],Ys[EndPoint],0,
								Xs[StartPoint],Ys[StartPoint],0,Xs[PreviousPoint],Ys[PreviousPoint],0);
					
					for (var i=Points[0].length-1;i>=0;i--)
					{
						X1s.push(Points[0][i]);
						Y1s.push(Points[1][i]);
					}
					X1s.push(Xs[EndPoint]);
					Y1s.push(Ys[EndPoint]);
				}
			}
		}
	}
	return([X1s,Y1s]);
}
//****************************************************************************************************
// Higher-level functions to return curves with arrows
//****************************************************************************************************
/**
* Find a coordinate to the "left" and "right" of the specified coordinate.
* The second and third coordinate define the direction of the path of the 
* spline while the distance defines the distance to move left and right of
* the spline.
*
* X,Y - coordinate
* XS1, YS1 - 
* @private
*/
CMUtilityBezier.FindBannerPoints=function(X,Y,XS1,YS1,XS2,YS2,Distance2)
{
	var DX=XS2-XS1; // find the slope of the first line
	var DY=YS2-YS1;
	
	// make the DX,DY into a unit vector
	var Distance=Math.sqrt(DX*DX+DY*DY);
	DX=DX/Distance*Distance2;
	DY=DY/Distance*Distance2;
	
	var X1=X+DY;
	var Y1=Y-DX;
	
	var X2=X-DY;
	var Y2=Y+DX;
	
	var Left={
		X:X1,
		Y:Y1
	};
	var Right={
		X:X2,
		Y:Y2
	};
	var Result=[Left,Right];
	
	return(Result);
}
/**
* Finds the points to the left and right of the specified points based on a rotation angle
* and distances before rotation
* @private
*
* Inputs:
* X,Y - origin point
* Angle - Rotation angle in radians
* DX,DY - distance to move before the rotation is applied
*/
CMUtilityBezier.GetPointsOffLine=function(X,Y,Angle,DX,DY)
{
	var Sine=Math.sin(Angle);
	var Cosine=Math.cos(Angle);
	
	var RightX=X-(Sine*DY)-(Cosine*DX);
	var RightY=Y-(Cosine*DY)+(Sine*DX);
	var LeftX=X-(Sine*DY)+(Cosine*DX);
	var LeftY=Y-(Cosine*DY)-(Sine*DX);

	Result={
		RightX:RightX,
		RightY:RightY,
		LeftX:LeftX,
		LeftY:LeftY,
	};
	return(Result);
}
/**
* Return a set of X and Y coordinates that represent the outline of a curve that has width
* and has an arrow at the end.
* @public
* @param Xs - horizontal coordinate array of control points to follow.
* @param Ys - horizontal coordinate array of control points to follow.
* @param BarbWidth - Width of the bard of the arrow 
* @param BarbLength - Length of the portion of the arrow that is before the connection between the curve and the arrow head
* @param ShaftWidth - Width of the arrow shaft (i.e. the width of the curve)
* @param HeadLength - Length of the head of the arrow 
*/
CMUtilityBezier.GetCurveWithArrow=function(Xs,Ys,BarbWidth,BarbLength,ShaftWidth,HeadLength)
{
	var LastControlIndex=Xs.length-1;
	
	//*****************************************************************************************************
	// find the bezier curve through the control points and put it's points into the arrays X1s,Y1s
	//*****************************************************************************************************
	
	// get the first bezier curve at the start of the curve
	
	var X1s=[];
	var Y1s=[];
	
	X1s.push(Xs[0]); // push the first control point
	Y1s.push(Ys[0]);
	
	if (Xs.length==2)
	{
		X1s.push(Xs[1]);
		Y1s.push(Ys[1]);
	}
	else if (Xs.length>2)
	{
		var Points1=CMUtilityBezier.GetThreePoint3D(CMItemPolyArrow.NUM_STEPS,Xs[0],Ys[0],0,Xs[1],Ys[1],0,Xs[2],Ys[2],0);

		for (var i=0;i<Points1[0].length;i++)
		{
			X1s.push(Points1[0][i]);
			Y1s.push(Points1[1][i]);
		}
		
//		DrawBezier(TheView,Xs[0],Ys[0],Points1,Xs[1],Ys[1]); // draw spline (debugging)
		
		// get the in between Bezier curves
		
		for (var ControlIndex=1;ControlIndex<Xs.length-1;ControlIndex++)
		{
			X1s.push(Xs[ControlIndex]);
			Y1s.push(Ys[ControlIndex]);
			
			var Points2=CMUtilityBezier.GetFourPoint2D(CMItemPolyArrow.NUM_STEPS,Xs[ControlIndex-1],Ys[ControlIndex-1],
					Xs[ControlIndex],Ys[ControlIndex],
					Xs[ControlIndex+1],Ys[ControlIndex+1],
					Xs[ControlIndex+2],Ys[ControlIndex+2]);

			for (var i=0;i<Points2[0].length;i++)
			{
				X1s.push(Points2[0][i]);
				Y1s.push(Points2[1][i]);
			}
			
//			DrawBezier(TheView,Xs[ControlIndex],Ys[ControlIndex],Points2,Xs[ControlIndex+1],Ys[ControlIndex+1]);
		}
		
		// get the last Bezier curve
		
		X1s.push(Xs[LastControlIndex-1]);
		Y1s.push(Ys[LastControlIndex-1]);
		
		var Points3=CMUtilityBezier.GetThreePoint3D(CMItemPolyArrow.NUM_STEPS,Xs[LastControlIndex],Ys[LastControlIndex],0,
			Xs[LastControlIndex-1],Ys[LastControlIndex-1],0,Xs[LastControlIndex-2],Ys[LastControlIndex-2],0);
		
		for (var i=Points3[0].length-1;i>=0;i--)
		{
			X1s.push(Points3[0][i]);
			Y1s.push(Points3[1][i]);
		}
//		DrawBezier(TheView,Xs[LastControlIndex],Ys[LastControlIndex],Points3,Xs[LastControlIndex-1],Ys[LastControlIndex-1]);

		//*****************************************************************************************************
		// find the index to the last Bezier segment to include in the arrow sides.  In other words,
		// Work back from the last point along the spine of the arrow until we find a Bezier segment
		// that is further from the point of the arrow (measured along the spine) than the notch.  This
		// becomes our last segment so that the outsides of the arrow do not go into the arrow head
		//*****************************************************************************************************
		
		var Length=0;
		
		var X=Xs[LastControlIndex];
		var Y=Ys[LastControlIndex];
		
		var LastCoordinateIndex=X1s.length-1;
		
		for (var i=0;(i<Points3[0].length)&&(Length<ShaftWidth);i++)
		{
			Length+=CMUtilities.GetLength(X,Y,Points3[0][i],Points3[1][i]);
			
			LastCoordinateIndex--;
			
			X=Points3[0][i];
			Y=Points3[1][i];
		}
		if (LastCoordinateIndex>0) LastCoordinateIndex--;
		
	}
	//
	
	//*****************************************************************************************************
	// Find the distances to the control points on the barb and notch
	//*****************************************************************************************************
	
	// find the angle for the arrow head
	
	var LineDX=X1s[X1s.length-1]-X1s[X1s.length-2];
	var LineDY=Y1s[X1s.length-1]-Y1s[X1s.length-2];
	
//		var LineDX=Xs[LastControlIndex]-Points3[0][0];
//		var LineDY=Ys[LastControlIndex]-Points3[1][0];
	
	var Angle=Math.atan2(LineDX,LineDY);
	
	var Result=CMUtilityBezier.GetPointsOffLine(Xs[LastControlIndex],Ys[LastControlIndex],Angle,BarbWidth,BarbLength);

	var BarbRightX=Result.RightX;
	var BarbRightY=Result.RightY;
	var BarbLeftX=Result.LeftX;
	var BarbLeftY=Result.LeftY;
	
	var Result=CMUtilityBezier.GetPointsOffLine(Xs[LastControlIndex],Ys[LastControlIndex],Angle,ShaftWidth,HeadLength);
	
	var NotchRightX=Result.RightX;
	var NotchRightY=Result.RightY;
	var NotchLeftX=Result.LeftX;
	var NotchLeftY=Result.LeftY;
	
	//*****************************************************************************************************
	// Move the points to the left and right and put them in LeftXs,LeftYs,RightXs,RightYs
	//*****************************************************************************************************
	
	// find first points at the start of the arrow
	
	var LeftXs=[];
	var LeftYs=[];
	
	var RightXs=[];
	var RightYs=[];
		
	var BannerPoints=CMUtilityBezier.FindBannerPoints(X1s[0],Y1s[0],X1s[0],Y1s[0],X1s[1],Y1s[1],ShaftWidth);
//		var BannerPoints=FindBannerPoints(Xs[0],Ys[0],Xs[0],Ys[0],Points1[0][1],Points1[1][1],ShaftWidth);
	
	LeftXs.push(BannerPoints[0].X);
	LeftYs.push(BannerPoints[0].Y);
	RightXs.push(BannerPoints[1].X);
	RightYs.push(BannerPoints[1].Y);
	
	for (var i=0;i<LastCoordinateIndex;i++)
	{
		var BannerPoints=CMUtilityBezier.FindBannerPoints(X1s[i],Y1s[i],X1s[i],Y1s[i],X1s[i+1],Y1s[i+1],ShaftWidth);
		
		LeftXs.push(BannerPoints[0].X);
		LeftYs.push(BannerPoints[0].Y);
		RightXs.push(BannerPoints[1].X);
		RightYs.push(BannerPoints[1].Y);
	}
	
	//*****************************************************************************************************
	// Find the final points along the outside of the arrow's polygon
	// This includes copying the outsides of the right side, then adding the arrow head, then adding
	// the points along the left side in reverse order.
	//*****************************************************************************************************
	
	var FinalXs=[]; // arrays for the final coordinates
	var FinalYs=[];
	
	// copy the right side coordinates
	for (var i=0;i<RightXs.length;i++) 
	{
		FinalXs.push(RightXs[i]);
		FinalYs.push(RightYs[i]);
	}
	
	// add the arrow head
	FinalXs.push(NotchRightX); 
	FinalYs.push(NotchRightY);
	 
	FinalXs.push(BarbRightX);
	FinalYs.push(BarbRightY);
	
	FinalXs.push(Xs[LastControlIndex]);
	FinalYs.push(Ys[LastControlIndex]);
	
	FinalXs.push(BarbLeftX);
	FinalYs.push(BarbLeftY);
	
	FinalXs.push(NotchLeftX);
	FinalYs.push(NotchLeftY);
	
	// copy the left side of the arrow in reverse order
	for (var i=0;i<LeftXs.length;i++)
	{
		FinalXs.push(LeftXs[LeftXs.length-i-1]);
		FinalYs.push(LeftYs[LeftYs.length-i-1]);
	}
	
	// connect the polygon back to the first point.
	FinalXs.push(FinalXs[0]);
	FinalYs.push(FinalYs[0]);
	
	var Result=
	{
		FinalXs:FinalXs,
		FinalYs:FinalYs,
		SpineXs:X1s,
		SpineYs:Y1s,
	}
	return(Result);
}


//CanvasMap/js/CMView.js
/**
* CMView Class
*
* This class manages the canvas and allows the map to be zoomed and panned.
* It also provides commont painting functions such as rectangles, circles,
* text, and rasters.  The functions are available with locations in pixel
* or reference (map) coordinate values.
*
* The view is also an item that can appear in other views.  This is important
* for authors working with 3D scenes to be able to see where their views are.
*
* @module CMView
* @Copyright HSU, Jim Graham, 2019
*/

/**
* Tool definitions
* @enum
*/
CMView.TOOL_NONE=0; // no tool (disables moving the background)
CMView.TOOL_HAND=1; // pan the map (the hand)
CMView.TOOL_INFO=2; // click to get information on features ("I" tool)
CMView.TOOL_EDIT=3; // user is editing existing spatial data  (not used)
CMView.TOOL_ADD=4; // user is adding data (not used)
CMView.TOOL_SELECT=5; // combined with INFO on the web (arrow tool)

/**
* Message definitions
*/
CMView.MESSAGE_MOUSE_MOVE=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent
CMView.MESSAGE_MOUSE_DOWN=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent
CMView.MESSAGE_MOUSE_UP=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent
CMView.MESSAGE_MOUSE_WHEEL=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent
CMView.MESSAGE_KEY_DOWN=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent
CMView.MESSAGE_KEY_UP=CMBase.GetUniqueNumber(); // AdditionalInfo=TheEvent

//******************************************************************
// Constructors
//******************************************************************
CMView.UniqueNumber=0;
/**
* @public, @constructs
*/
function CMView() 
{
	CMBase.call(this);
	this.UniqueNumber=CMView.UniqueNumber;
	CMView.UniqueNumber++;

	// CMBase does not have settings so this is the main property for settings
	this.Settings={};
	
	// additional settings (cached)
	
	this.CurrentTool=CMView.TOOL_SELECT;

	this.CollisionChecking=true;
	
	// other properties
	this.MapElements=[]; // should either be in the view or in a layer
	
	this.TheCanvasElement=null; // the canvas that contains this view
	
	this.ToolHandler=null;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=null; // just used to access context quicker for drawing
	
	// objects that have been drawn into the view thus far for collision detection
	
	this.CollisionArray=null;
}
CMView.prototype=Object.create(CMBase.prototype); // inherit prototype functions from CMItem

CMView.prototype.contructor=CMView; // override the constructor to go to ours

//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMView.SettingDefintions=
{
	View:
	{
		CollisionChecking: { Name:"Collision Checking",Type:CMBase.DATA_TYPE_BOOLEAN, Default:true }
		
		// these are similar to those in CMItem (jjg - in the future, CMView will inherit from CMItem)
	},
	Item:
	{
		Name: { Name:"Name",Type:CMBase.DATA_TYPE_STRING, Default:"" }, // Name that appears in the item and layer lists
		
		Status: { Name:"Status",Type:CMBase.DATA_TYPE_ENUMERATED, Options:[CMItem.STATUS_HIDDEN,CMItem.STATUS_VISIBLE,CMItem.STATUS_SELECTABLE,CMItem.STATUS_EDITABLE],Default:CMItem.STATUS_SELECTABLE },// How the item appears to the user and how the user can interact with it

		PositionOffset: { Name:"Position Offset Vector",Type:CMBase.DATA_TYPE_VECTOR, Default:null }, // x,y, and z values to offset the item
		Rotation: { Name:"Rotation Vector",Type:CMBase.DATA_TYPE_VECTOR, Default:null }, // pitch, roll, and yaw values (x,y,z) values to roatate the item in degrees
	},
};

//******************************************************************
// CMBase Functions
//******************************************************************

CMView.prototype.GetSettingsDefinitions=function() 
{
	return(CMView.SettingDefintions); 
}

CMView.prototype.CMBase_SetSettings=CMBase.prototype.SetSettings;

CMView.prototype.SetSettings=function(NewSettings,TimeSlice) 
{
	if (NewSettings["View"]!=undefined)
	{
		if (NewSettings["View"]["CollisionChecking"]!=undefined)
		{
			this.CollisionChecking=NewSettings["View"]["CollisionChecking"];
		}
	}
	this.CMBase_SetSettings(NewSettings,TimeSlice);
}
//******************************************************************
// Protected CMView Functions
//******************************************************************
/**
* Sets a style for painting.  The existing style is saved.
* New style is an array of key value pairs (i.e.  objects).  This
* may be called on each item so it must run as fast as possible.
* @protected
* @param NewStyle the style to use for painting
* @param SaveCurrentStyle - true to have the current style saved
*/
CMView.SetStyleToContext=function(NewStyle,SaveCurrentStyle,TheContext,TheView) 
{
	// this has to be saved each time so the restores are synchronized
	if (SaveCurrentStyle!==false) TheContext.save();
	
	if ((NewStyle!=null)&&(NewStyle!=undefined))
	{
		TheContext.shadowBlur=0;
		
		for (var key in NewStyle)
		{
			if (key=="PatternImage")
			{
				var ThePattern = TheContext.createPattern(NewStyle[key], "repeat");
				TheContext["fillStyle"]=ThePattern;
			}
			else if (key=="GradientType")
			{
				var TheColors=NewStyle["GradientColors"];
				var TheCoordinates=NewStyle["GradientCoordinates"];
				var GradientRadius1=NewStyle["GradientRadius1"];
				var GradientRadius2=NewStyle["GradientRadius2"];
				
				if (GradientRadius1==undefined) GradientRadius1=0;
				if (GradientRadius2==undefined) GradientRadius2=100;
				
				var TheGradient=null;
				
				var X0=0;
				var Y0=0;
				var X1=500;
				var Y1=500;
				
				if (TheCoordinates!=undefined)
				{
					X0=TheCoordinates.Xs[0];
					Y0=TheCoordinates.Ys[0];
					X1=TheCoordinates.Xs[1];
					Y1=TheCoordinates.Ys[1];
				}
				
				if (NewStyle[key]=="Linear")
				{
					TheGradient=TheContext.createLinearGradient(X0,Y0,X1,Y1);
				}
				else
				{
					TheGradient=TheContext.createRadialGradient(X0,Y0,GradientRadius1,X1,Y1,GradientRadius2);
				}
				
				if (TheColors!=undefined)
				{
					for (var i=0;i<TheColors.length;i++)
					{
						TheGradient.addColorStop(i,TheColors[i]);
					}
				}
				TheContext["fillStyle"]=TheGradient;
			}
			else  if ((key=="GradientColors")||(key=="GradientCoordinates")||(key=="GradientRadius")) // ignore these as they are handled above
			{
			}
			else  if ((key=="font")) // have to get the font information and conver tthe size to pixels if needed
			{
				var Font=NewStyle[key];
				
				var Tokens=Font.split(" ");
				
				var FontSize="12px";
				
				// find the font size as it is the only one that starts with a digit
				var SizeIndex=-1;
				for (var i=0;i<Tokens.length;i++)
				{
					var Token=Tokens[i];
					
					// if the first charater is a number, must be the font size entry
					if (Token[i] >= '0' && Token[i]<='9' ) SizeIndex=i;
				}
				// convert the font size to pixels if needed
				if (SizeIndex!=-1)
				{
					FontSize=Tokens[SizeIndex];
					
					var Index=FontSize.indexOf("px");
					
					if (Index==-1) // "px" not specified, convert to reference units
					{
						FontSize=parseFloat(FontSize); //.substring(0,Index); // get just the size
						FontSize=-TheView.GetPixelHeightFromRefHeight(parseFloat(FontSize)); // convert the size to pixel units
						
						FontSize=FontSize+"px"; // convert the FontSize back to a string
					}
				}
				Font="";
				for (var i=0;i<Tokens.length;i++)
				{
					if (i!=0) Font+=" ";
					
					if (i==SizeIndex) Font+=FontSize;
					else Font+=Tokens[i];
				}
				TheContext[key]=Font;
			}
			else
			{
				TheContext[key]=NewStyle[key];
			}
		}
	}
}

//******************************************************************
// Public CMView Functions
//******************************************************************
CMView.prototype.Repaint=function() 
{
	var Result=this.GetParent(CMScene);
	if (Result!=null) Result.Repaint();
}

/**
* Returns the context for the CanvasMap's canvas.  This is not used
* often but is required do things like great gradients.
* @public
*/
CMView.prototype.GetContext=function()
{
	return(this.TheContext);
}


//*******************************************************************
// CMView functions to handle events.
// These functions should be overriden by subclasses
//*******************************************************************

/**
* Handles a mouse down event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseDown=function(TheEvent)
{
	var Used=false;
		
	CMMainContainer.HidePopupWindows();
	
	return(Used);
}
/**
* Handles a mouse move event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseMove=function(TheEvent)
{
	var Used=false;
	
	if (!TheEvent) { TheEvent=window.event; }

	this.SendMessageToListeners(CMView.MESSAGE_MOUSE_MOVE,TheEvent);
	
	return(Used);
}
/**
* Handles a mouse move up in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseUp=function(TheEvent)
{
	var Used=false;
		
	if (!TheEvent) { TheEvent=window.event; }
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	return(Used);

}
/**
* Handles a mouse wheel event.  Can be overriden to change the action taken when the 
* user moves the wheel.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView.prototype.MouseWheel=function(TheEvent)
{
	var Used=false;
	
	CMMainContainer.HidePopupWindows();
	
	if (!TheEvent) { TheEvent=window.event; }
	
	var Delta=TheEvent.detail? TheEvent.detail*(-120) : TheEvent.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
	
	// prevent the wheele from scrolling the page
	
	if (TheEvent.preventDefault)  TheEvent.preventDefault()
	
	return(Used);
}
CMView.prototype.KeyDown=function(TheEvent)
{
	var Used=false;
	
//	CMMainContainer.HidePopupWindows();
	
	return(Used);
}
CMView.prototype.KeyUp=function(TheEvent)
{
	var Used=false;
	
//	CMMainContainer.HidePopupWindows();
	
	return(Used);
}


//**********************************************************
// Additional functions to be overriden by subclasses
//**********************************************************
/**
* @protected, @override
*/
CMView.prototype.GetCoordinateStringFromEvent=function(TheEvent,CoordinateUnits)
{
	
	return(Text);
}
//******************************************************************
// Map Elements
//******************************************************************
/**
* Add a new map element to the scene (e.g. a scale bar)
* @public
* @param TheElement - 
*/
CMView.prototype.AddMapElement=function(TheElement) 
{
	this.MapElements.push(TheElement);
	TheElement.SetParent(this);
}


//******************************************************************
// Protected  Functions
//******************************************************************
/**
* Used by the canvas map to give this view the ability to call its canvas map
* @protected
*/
CMView.prototype.Setup=function(TheCanvasElement)
{
	//this.TheCanvasContainer=TheCanvasContainer;
	this.TheCanvasElement=TheCanvasElement;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=this.TheCanvasElement.getContext('2d');
	
	this.TheCanvasElement.style.cursor="crosshair";
	this.SetTool(CMView.TOOL_SELECT);
}
/*
* 
* @protected
*/
CMView.prototype.Resize=function()
{
	var TheElement=this.TheCanvasElement;

	// the canvas aspect ratio is not correct unless we set the "width" and "height" of the element
	// rather than the style.  This must be done or it will display maps distorted
	
	var TheParent=TheElement.parentNode;
	var ParentWidth=jQuery(TheParent).width();
	var ParentHeight=jQuery(TheParent).height();

	TheElement.width=ParentWidth;
	TheElement.height=ParentHeight;
	
	// resize the map elements
	for (var i=0;i<this.MapElements.length;i++)
	{
		var TheMapElement=this.MapElements[i];
	}
}

CMView.prototype.SetToolHandler=function(NewToolHandler)
{
	this.ToolHandler=NewToolHandler;
}
CMView.prototype.GetToolHandler=function()
{
	return(this.ToolHandler);
}
CMView.prototype.GetCanvasElement=function()
{
	return(this.TheCanvasElement);
}

//*******************************************************************
// Mouse events
//*******************************************************************
/**
* Adds the standard event handlers to the view
*/
CMView.prototype.AddMouseEventHandlers=function()
{
	var TheCanvasElement=this.GetCanvasElement();
	
	TheCanvasElement.TheView=this; // required by the mouse functions
	
	TheCanvasElement.addEventListener("mousedown",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.MouseDown(TheEvent);	
			TheEvent.stopPropagation(); // stop the document from hidding a popup window
		}
	});
	TheCanvasElement.addEventListener("mousemove",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.MouseMove(TheEvent);
		}
	});
	TheCanvasElement.addEventListener("mouseup",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.MouseUp(TheEvent);	
		}
	});
	//***************************************************************************************
	// jQuery does not yet support the mouse wheel so we have to do it the old way
	
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
	 
	if (TheCanvasElement.attachEvent) //if IE (and Opera depending on user setting)
	{
		TheCanvasElement.attachEvent("on"+mousewheelevt, function(TheEvent)
		{
			var Result; // return result is undefined typically
			
			CMMainContainer.HidePopupWindows(); // static function
			
			var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
			
			var Result=this.TheView.MouseWheel(TheEvent);
				
			return(Result);
		});
	}
	else if (TheCanvasElement.addEventListener) //WC3 browsers
	{
		TheCanvasElement.addEventListener(mousewheelevt, function(TheEvent)
		{
			var Result; // return result is undefined typically
			
			CMMainContainer.HidePopupWindows(); // static function
			
			var TheEvent=window.event || TheEvent // grab the event passed in or globally (IE compatibility)
			
			var Result=this.TheView.MouseWheel(TheEvent);
				
			return(Result);
		},
		false);
	}
}
CMView.prototype.AddKeyEventHandlers=function()
{
	var TheCanvasElement=this.GetCanvasElement();
	
	window.TheView=this; // jjg - there must be  a better way!
	
	window.addEventListener("keydown",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.KeyDown(TheEvent);	
		}
	}, false );
	
	window.addEventListener("keyup",function(TheEvent) 
	{
		if (this.TheView!=null)
		{
			this.TheView.KeyUp(TheEvent);	
		}
	}, false );
}

/**
* Adds the mobile event handlers based on the Hammer library
*/
CMView.prototype.AddMobileEvents=function(CanvasContainer)
{
	// create a simple instance
	// by default, it only adds horizontal recognizers
/*	var mc = new Hammer(CanvasContainer);
	
	// let the pan gesture support all directions.
	// this will block the vertical scrolling on a touch-device while on the element
	mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	var pinch = new Hammer.Pinch();
	
	mc.add([pinch]);
	
	mc.TheView=this;
	
	// listen to events...
	mc.on("pinch panleft panright panup pandown", function(ev)  //  tap press
	{
		var TheView=mc.TheView;
		
		// needs to call function that is overriden by subclasses
		var RefDistance=TheView.GetRefWidthFromPixelWidth(CMMainContainer.GESTURE_PAN);
		var RefCenter=TheView.GetRefCenter();
		var RefX=RefCenter.RefX;
		var RefY=RefCenter.RefY;

		MapHeader.innerHTML=ev.type;
		
		if (ev.type=="panup")
		{
			RefY-=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="pandown")
		{
			RefY+=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="panleft")
		{
			RefX+=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="panright")
		{
			RefX-=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="pinch")
		{
			var ZoomLevel=TheView.GetZoomLevel();
			
			MapHeader.textContent = ev.additionalEvent ;
			if (ev.additionalEvent=="pinchin")
			{
				TheView.ZoomTo(ZoomLevel-CMMainContainer.GESTURE_ZOOM);
			}
			else
			{
				TheView.ZoomTo(ZoomLevel+CMMainContainer.GESTURE_ZOOM);
			}
		}
	});	 
*/}
//******************************************************************
// Functions to set the current tool
//******************************************************************

/**
* Change the current tool that will be used when the user clicks with 
* the mouse 
* @public
* @param NewTool from the enums: CMView.TOOL_HAND,...
*/
CMView.prototype.SetTool=function(NewTool)
{
	 switch(NewTool)
	 {
	case CMView.TOOL_HAND:
		this.TheCanvasElement.style.cursor="move";
		break;
	case CMView.TOOL_INFO:
	case CMView.TOOL_SELECT:
		this.TheCanvasElement.style.cursor="crosshair";
		break;
	case CMView.TOOL_EDIT:
		this.TheCanvasElement.style.cursor="crosshair";
		break;
	 }

	this.CurrentTool=NewTool;
}

/**
* Returns the current tool
* @public
* @returns NewTool from the enums: CMView.TOOL_HAND,...
*/
CMView.prototype.GetTool=function() { return(this.CurrentTool); }

//*******************************************************************
// CMView functions to manage painting.  Specifically styles,
// get information on fonts, and manage collisions.
//*******************************************************************
CMView.prototype.SetStyle=function(NewStyle,SaveCurrentStyle) 
{
	console.log("CMView.SetStyle() needs to be overriden");
}
/**
* Saves the current style to a stack
* @public
*/
CMView.prototype.SaveStyle=function() 
{
	this.TheContext.save();
}
/**
* Restores the style from the stack
* @public
*/
CMView.prototype.RestoreStyle=function() 
{
	this.TheContext.restore();
}
/**
* Starts painting.  Only called by the Scene
* @protected
*/
CMView.prototype.PaintStart=function() 
{
	if (this.GetSetting("View","CollisionChecking")) // jjg - might want to use a local variable for speed later
	{
		this.CollisionArray=[];
	}
}
/**
* Paints the contents of the view.  Called by the Scene which is called by the
* CanvasMap object.
* @public
*/
CMView.prototype.Paint=function() 
{
	this.TheContext.clearRect(0,0,this.TheCanvasElement.width,this.TheCanvasElement.height);
	this.GetParent(CMScene).Paint(this);
};
/**
* Ends painting.  Only called by the Scene
* @protected
*/
CMView.prototype.PaintEnd=function() 
{
	// paint the additional map elemetns (north arrows, scale bars, etc).
	
	for (var i=0;i<this.MapElements.length;i++)
	{
		this.MapElements[i].Paint(this);
	}

	this.ResetCollisions();
}
/**
* Checks if there was a collision between the specific bounds and a point feature
* that has already been painted.  Typically only called by a layer.
* @protected
*/
CMView.prototype.CheckCollision=function(Bounds) 
{
	var Result=false;
	
	if (this.CollisionArray!==null) // CollisionChecking==true
	{
		for (var i=0;(i<this.CollisionArray.length)&&(Result==false);i++)
		{
			if (CMUtilities.BoundsOverlap(Bounds,this.CollisionArray[i]))
			{
				Result=true;
			}											   
		}
	}
	return(Result);
}
/**
* Checks if there was a collision between the specific bounds and a point feature
* that has already been painted.  Typically only called by a layer.
* @protected
*/
CMView.prototype.AddToCollisions=function(Bounds) 
{
	if (this.CollisionArray!==null) // CollisionChecking==true
	{
		this.CollisionArray.push(Bounds);
	}

}
/**
* Collisions are reset at the end of painting.  This function will reset the collision
* array during painting if desired
*/
CMView.prototype.ResetCollisions=function() 
{
	if (this.GetSetting("View","CollisionChecking")) // jjg - might want to use a local variable for speed later
	{
		this.CollisionArray=[];
	}
}
/**
* Gets the width of the specified text in pixels based on the current font settings
*/
CMView.prototype.GetTextWidthInPixels=function(Text)
{
	var TextWidth=this.TheContext.measureText(Text).width;
	return(TextWidth);
}

//*******************************************************************
// CMView functions to paint simple graphic elements with pixel coordinates
//*******************************************************************

/**
* Paints an image at the specified pixel location.
* CanvasMap object.
* @public
* @param TheImage
* @param PixelX
* @param PixelY
*/
CMView.prototype.PaintImage=function(TheImage,PixelX,PixelY)
{
	this.TheContext.drawImage(TheImage,PixelX,PixelY);
};
/**
* Paints the background of the canvas element.
* @public
*/
CMView.prototype.PaintBackground=function()
{
//	if (Color!=null) 
	{
		this.TheContext.fillRect(0,0,this.TheCanvasElement.width,this.TheCanvasElement.height);
	}
};
/**
* Paints a circle using pixel coordinate values
* @public
* @param X - horizontal pixel center of the circle
* @param Y - vertical pixel center of the circle
* @param RadiusInPixels - 
*/
CMView.prototype.PaintCircle=function(X,Y,RadiusInPixels)
{
	this.TheContext.beginPath();
	
	this.TheContext.arc(X,Y,RadiusInPixels,0,2*Math.PI);
	
	if (this.TheContext.strokeStyle!=null) this.TheContext.stroke();
	if (this.TheContext.fillStyle!=null) this.TheContext.fill();
};
/*
* Paints a rectangle based on the specified bounds
* @public
* @param PixelXMin - Left side of the rectangle
* @param PixelXMax - Right side of the rectangle
* @param PixelYMin - Top of the rectangle
* @param PixelYMax - Bottom of the rectangle
*/
CMView.prototype.PaintRect=function(PixelXMin,PixelXMax,PixelYMin,PixelYMax)
{
	// Fill the path we just finished drawing with color
	if (this.TheContext.fillStyle!=null) 
	{
		this.TheContext.fillRect(PixelXMin,PixelYMin,PixelXMax-PixelXMin,PixelYMax-PixelYMin);
	}
	if (this.TheContext.strokeStyle!=null) 
	{
		if ((this.TheContext.fillStyle==null)||(this.TheContext.shadowColor==undefined)) // no fill or no shadow
		{
			this.TheContext.stroke();
		}
		else // filled and has a shadow that we must disable
		{
			var TheShadowColor=this.TheContext.shadowColor;
			this.TheContext.shadowColor="rgba(0,0,0,0)";
			
			this.TheContext.strokeRect(PixelXMin,PixelYMin,PixelXMax-PixelXMin,PixelYMax-PixelYMin);
			
			this.TheContext.shadowColor=TheShadowColor;
		}
	}
}
/*
* Paints an arc based on the specified bounds.  The arc will be drawn as if it was
* drawing an oval within the bounds but only the area of the oval defined by the
* start and end angles will be painted.  This can be used to paint circles (or ovals)
* by making the start angle 0 and end angle 2*Math.PI.
*
* @public
* @param PixelXMin - Left side of the rectangle
* @param PixelXMax - Right side of the rectangle
* @param PixelYMin - Top of the rectangle
* @param PixelYMax - Bottom of the rectangle
* @param StartAngle - Start angle for the start of the arc, in radians
* @param EndAngle - End angle for the start of the arc, in radians
*/

CMView.prototype.PaintArc=function(PixelXMin,PixelXMax,PixelYMin,PixelYMax,StartAngle,EndAngle)
{
	var PixelCenterX=(PixelXMin+PixelXMax)/2;
	var PixelCenterY=(PixelYMin+PixelYMax)/2;
	
	var Radius=(PixelXMax-PixelXMin)/2;
	
	this.TheContext.save(); // save the trnasformation matrix
	
	this.TheContext.translate(PixelCenterX,PixelCenterY); // transate to center of arc's oval
	
	// scale the arc vertically with the width as the radius and the height as a multiple of the radius
	var HeightFactor=(PixelYMax-PixelYMin)/(PixelXMax-PixelXMin);
	
	this.TheContext.scale(1, HeightFactor);
	
	// draw the arc
	this.TheContext.beginPath();
	this.TheContext.arc(0, 0, Radius,StartAngle,EndAngle, false);
	
	this.TheContext.restore(); // put the original translation matrix back
	
	if (this.TheContext.strokeStyle!=null) 
	{
		this.TheContext.stroke();
	}
	if (this.TheContext.fillStyle!=null) 
	{
		this.TheContext.fill();
	}
}

/*
* Function to paint a rounded rectangle
* Adapted from: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
* @public
* @param PixelXMin - Left side of the rectangle
* @param PixelXMax - Right side of the rectangle
* @param PixelYMin - Top of the rectangle
* @param PixelYMax - Bottom of the rectangle
* @param PixelXRadius - Horizontal radius or both if PixelYRadius is not specified
* @param PixelYRadius - Vertical radius of the corners
*/
CMView.prototype.PaintRoundedRect=function(PixelXMin,PixelXMax,PixelYMin,PixelYMax,PixelXRadius,PixelYRadius) 
{
	if (typeof PixelYRadius === 'undefined') { PixelYRadius=PixelXRadius; }
	
	this.TheContext.beginPath();
	this.TheContext.moveTo(PixelXMin + PixelXRadius, PixelYMin); // left side of top
	this.TheContext.lineTo(PixelXMax - PixelXRadius, PixelYMin); // right side of top
	this.TheContext.quadraticCurveTo(PixelXMax, PixelYMin, PixelXMax, PixelYMin+PixelYRadius); // top of right side
	this.TheContext.lineTo(PixelXMax, PixelYMax-PixelYRadius); // bottom of right side
	this.TheContext.quadraticCurveTo(PixelXMax, PixelYMax, PixelXMax - PixelXRadius,PixelYMax); // right of bottom
	this.TheContext.lineTo(PixelXMin+PixelXRadius, PixelYMax); // left of bottom
	this.TheContext.quadraticCurveTo(PixelXMin, PixelYMax, PixelXMin, PixelYMax - PixelYRadius); // bottom of left side
	this.TheContext.lineTo(PixelXMin, PixelYMin+PixelYRadius); // top of left side
	this.TheContext.quadraticCurveTo(PixelXMin, PixelYMin, PixelXMin+PixelXRadius,PixelYMin); // back to left side of top
	this.TheContext.closePath();
	
	if (this.TheContext.strokeStyle!=null) this.TheContext.stroke();
	if (this.TheContext.fillStyle!=null) this.TheContext.fill();
}
/**
* Function to paint text with the current font metrics in the context.
* @public
* @param XInPixels - left edge of the text
* @param YInPixels - base line for the text
* @param Text - the text to paint
* @param RadAngle - optional angle to rotate the text
*/
CMView.prototype.PaintText=function(XInPixels,YInPixels,Text,RadAngle)
{
	if ((RadAngle!=undefined))
	{
		this.TheContext.save();
		try {
			// translate to the deisred location and then rotate about that location
			this.TheContext.translate(XInPixels,YInPixels);
			this.TheContext.rotate(RadAngle);
		
			// render the text
			//this.TheContext.fillText(Text,0,0);
			if (this.TheContext.strokeStyle!=null) this.TheContext.strokeText(Text,0,0);
			if (this.TheContext.fillStyle!=null) this.TheContext.fillText(Text,0,0);
		}
		catch(err) {
			console.log(err.message);
		}
		// take out the rotation and the translation
		this.TheContext.restore();
	}
	else
	{
		if (this.TheContext.strokeStyle!=null) this.TheContext.strokeText(Text,0,0);
		if (this.TheContext.fillStyle!=null) this.TheContext.fillText(Text,0,0);
//		this.TheContext.fillText(Text,XInPixels,YInPixels);
	}
}



//CanvasMap/js/CMView2D.js
/**
* CMView2D Class
*
* This class manages the canvas and allows the map to be zoomed and panned.
* It also provides commont painting functions such as rectangles, circles,
* text, and rasters.  The functions are available with locations in pixel
* or reference (map) coordinate values.
*
* The view is also an item that can appear in other views.  This is important
* for authors working with 3D scenes to be able to see where their views are.
*
* @module CMView2D
* @Copyright HSU, Jim Graham, 2019
*/
//******************************************************************
// Definitions
//******************************************************************
/**
* Below are the settings definitions.
* @public, @settings
*/
CMView2D.SettingDefintions=
{
	View2D:
	{
		MinZoom: { Name:"Min Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:-100000 },
		MaxZoom: { Name:"Max Zoom",Type:CMBase.DATA_TYPE_FLOAT, Default:100000 },
		MaxBounds: { Name:"Max Bounds",Type:CMBase.DATA_TYPE_COORDINATES, Default:null }
	}
};

//******************************************************************
// Constructors
//******************************************************************
/**
* @public, @constructs
*/
function CMView2D() 
{
	CMView.call(this);

	// settings for the area displayed in the view
	
	this.Settings.View2D=	
	{
		MinZoom:-100000,
		MaxZoom:100000,
		MaxBounds:null
	};
	
	// other properties )jjg settings?)
	this.ZoomLevel=0; // most zoomed in (typically 1 meter, may be a fraction of a degree)
	
	this.RefX=0; // Left edge of the map
	this.RefY=0; // Top of the map
	
	this.MinScale=1.0; // scale is computed from this (Scale=RefUnits per Pixel (Ref/Pixel))
	
	// other properties
	this.TheCanvasElement=null; // the canvas that contains this view
	
	this.ToolHandler=null;
	
	// Get the drawing context from our <canvas> 
	
	this.TheContext=null; // just used to access context quicker for drawing
}
CMView2D.prototype=Object.create(CMView.prototype); // inherit prototype functions from CMItem

CMView2D.prototype.contructor=CMView2D; // override the constructor to go to ours

//******************************************************************
// Private Functions
//******************************************************************

/**
* Paints the path that has been created in the Context for the view
* @private
* @param Closed - true to close the polygon (filled)
* @param Fill - true to fill the polygon
* @param Stroke - true to stroke (outline) the polygon
*/
CMView2D.prototype.PaintPath=function(Closed,Fill,Stroke)
{
	// initialize Fill to true if not specified and the polygon is closed
	if (Fill==undefined)
	{
		if (Closed) Fill=true;
		else Fill=false;
	}
	
	// initialize Stroke to true if not specified
	if (Stroke==undefined) Stroke=true; 
	
	// Fill the path we just finished drawing with color
	if ((Fill==undefined)||(Fill)) 
	{
		this.TheContext.fill();
	}
	if ((Stroke==undefined)||(Stroke)) 
	{
		if ((Fill==false)||(this.TheContext.shadowColor==undefined)) // no fill or no shadow
		{
			this.TheContext.stroke();
		}
		else // filled and has a shadow that we must disable
		{
			var TheShadowColor=this.TheContext.shadowColor;
			this.TheContext.shadowColor="rgba(0,0,0,0)";
			
			this.TheContext.stroke();
			
			this.TheContext.shadowColor=TheShadowColor;
		}
	}
}
/**
* Private function? to create a path
* @private
*/
CMView2D.prototype.CreatePath=function(Xs,Ys,Closed)
{
	// 
	var PixelX;
	var PixelY;
	var FirstPixelX;
	var FirstPixelY;
	var LastPixelX;
	var LastPixelY;
	
	for (var j=0; j < Xs.length; j++) 
	{
		var RefX=Xs[j];
		var RefY=Ys[j];

		// Scale the points of the coordinate
		
		Result=this.GetPixelFromRef(RefX,RefY);
		var PixelX=(Result.PixelX);
		var PixelY=(Result.PixelY);
		
		if (j==0) // first segment
		{
			this.TheContext.moveTo(PixelX, PixelY);
	
			FirstPixelX=PixelX;
			FirstPixelY=PixelY;
	
			LastPixelX=PixelX;
			LastPixelY=PixelY;
		}
		// draw each additional coordinate that is greater than one pixel from the current coordinate
		if ((PixelX!=LastPixelX)||(PixelY!=LastPixelY))
		{
			this.TheContext.lineTo(PixelX, PixelY); 
			
			LastPixelX=PixelX;
			LastPixelY=PixelY;
		}
	}
	if (Closed)
	{
		this.TheContext.closePath();
	}
}

//******************************************************************
// CMBase Functions
//******************************************************************

CMView2D.prototype.CMView_GetSettingsDefinitions=CMView.prototype.GetSettingsDefinitions;

CMView2D.prototype.GetSettingsDefinitions=function() 
{
	var Result=this.CMView_GetSettingsDefinitions();
	
	for (Key in CMView2D.SettingDefintions)
	{
		Result[Key]=CMView2D.SettingDefintions[Key];
	}

	return(Result); 
}
//******************************************************************
// Private CMView2D Functions 
//******************************************************************
/**
* If the MaxBounds has been set, check the current view bounds against it.
* @private
*/
CMView2D.prototype.CheckMaxBounds=function()
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvasElement.width*TheScale;
	var RefHeight=-this.TheCanvasElement.height*TheScale;
	
	var MaxBounds=this.GetSetting("View2D","MaxBounds");
	
	if (MaxBounds!=null)
	{
		if ((MaxBounds.Xs[1]-MaxBounds.Xs[0])<RefWidth) // area is smaller than allowed, center the data
		{
			// center on the center of the max bounds
			
			var NewCenterRefX=((MaxBounds.Xs[1]+MaxBounds.Xs[0])/2);
			
			this.RefX=NewCenterRefX-(RefWidth/2);
		}
		else
		{
			if (this.RefX<MaxBounds.Xs[0]) this.RefX=MaxBounds.Xs[0];
			if ((this.RefX+RefWidth)>MaxBounds.Xs[1]) this.RefX=MaxBounds.Xs[1]-RefWidth;
		}
		
		if ((MaxBounds.Ys[1]-MaxBounds.Ys[0])<-RefHeight) // area is smaller than allowed, center the data
		{
			// center on the center of the max bounds
			
			var NewCenterRefY=((MaxBounds.Ys[1]+MaxBounds.Ys[0])/2);
			
			this.RefY=NewCenterRefY-(RefHeight/2);
		}
		else
		{
			if (this.RefY>MaxBounds.Ys[1]) this.RefY=MaxBounds.Ys[1];
		
			if ((this.RefY+RefHeight)<MaxBounds.Ys[0]) this.RefY=MaxBounds.Ys[0]-RefHeight;
		}
	}
}
/*
* Returns the current scale in RefUnits per pixel
* @private
*/
CMView2D.prototype.GetScale=function()
{
	var CurrentScale=this.MinScale/Math.pow(2,this.ZoomLevel);
	
	return(CurrentScale);
}


//******************************************************************
// CMView mouse evenet functions that have been overridden
//******************************************************************

/**
* Adds the mobile event handlers based on the Hammer library
* @protected
*/
CMView2D.prototype.AddMobileEvents=function()
{
	// create a simple instance
	// by default, it only adds horizontal recognizers
	var TheContaner=this.GetParent(CMMainContainer);
	var CanvasContainer=TheContaner.GetElement(CMMainContainer.CANVAS_CONTAINER);
	
	var HammerTime = new Hammer(CanvasContainer);
	
	// let the pan gesture support all directions.
	// this will block the vertical scrolling on a touch-device while on the element
	HammerTime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	HammerTime.get('pinch').set({ enable: true });
	
	var pinch = new Hammer.Pinch();
	
	HammerTime.add([pinch]);
	
	HammerTime.TheView=this;
	
	// listen to events...
	HammerTime.on("pinch panleft panright panup pandown", function(ev)  //  tap press
	{
		var TheView=HammerTime.TheView;
		
		var RefDistance=TheView.GetRefWidthFromPixelWidth(CMMainContainer.GESTURE_PAN);
		var RefCenter=TheView.GetRefCenter();
		var RefX=RefCenter.RefX;
		var RefY=RefCenter.RefY;

		console.log(ev.type);
		
		if (ev.type=="panup")
		{
			RefY-=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="pandown")
		{
			RefY+=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="panleft")
		{
			RefX+=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="panright")
		{
			RefX-=RefDistance;
			TheView.SetRefCenter(RefX,RefY); // set the center of the map
		}
		else if (ev.type=="pinch")
		{
			var ZoomLevel=TheView.GetZoomLevel();
			
			MapHeader.textContent = ev.additionalEvent ;
			if (ev.additionalEvent=="pinchin")
			{
				TheView.ZoomIn();
			}
			else
			{
				TheView.ZoomOut();
			}
		}
	});	 
}

/**
* Handles a mouse down event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseDown=function(TheEvent)
{
	var Used=false;
		
	if (!TheEvent) { TheEvent=window.event; }
	
	CMMainContainer.HidePopupWindows();
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	var RefX=this.GetRefXFromPixelX(PixelX);
	var RefY=this.GetRefYFromPixelY(PixelY);
	
	if (this.ToolHandler!=null) // try a handler (they can be changed as layers are selected)
	{
		Used=this.ToolHandler.MouseDown(this,RefX,RefY,TheEvent);
	}
	if (Used==false) // try a regular tool
	{
		if (this.CurrentTool==CMView.TOOL_HAND) // dragging the scene around in the view
		{
			// get the current position of the mouse in ref coordinates and save it
			
			this.DragX=this.GetRefXFromPixelX(PixelX);
			this.DragY=this.GetRefYFromPixelY(PixelY);
			this.Dragging=true;
			Used=true;
		}
	}
	
	if (Used==false) // try the parent
	{
		var TheScene=this.GetParent(CMScene);
		
		Used=TheScene.SendMessageToDescendants(CMView.MESSAGE_MOUSE_DOWN,{TheView:this,RefX:RefX,RefY:RefY,TheEvent:TheEvent});
		
//		Used=this.GetParent(CMScene).MouseDown(this,RefX,RefY,TheEvent);
	}
	
	if (Used==false) // allow the select tool to drag if nothing else picked up the event
	{
		if (this.CurrentTool==CMView.TOOL_SELECT) 
		{
			this.DragX=this.GetRefXFromPixelX(PixelX);
			this.DragY=this.GetRefYFromPixelY(PixelY);
			this.Dragging=true;
			Used=true;
		}
	}

	return(Used);
}
/**
* Handles a mouse move event in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseMove=function(TheEvent)
{
	var Used=false;
	
	if (!TheEvent) { TheEvent=window.event; }

	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
		
	this.SendMessageToListeners(CMView.MESSAGE_MOUSE_MOVE,TheEvent);
	
	if (this.Dragging==true)
	{
		var RefWidth=this.GetRefWidthFromPixelWidth(PixelX);
		var RefHeight=this.GetRefHeightFromPixelHeight(PixelY);
		
		this.RefX=this.DragX-RefWidth;
		this.RefY=this.DragY-RefHeight;
		
		this.CheckMaxBounds();
		
		this.Repaint();
	}
	else
	{
		var RefX=this.GetRefXFromPixelX(PixelX);
		var RefY=this.GetRefYFromPixelY(PixelY);
		
		if (this.ToolHandler!=null)
		{
			Used=this.ToolHandler.MouseMove(this,RefX,RefY,TheEvent);
		}
		if (Used==false)
		{
			var TheScene=this.GetParent(CMScene);
			
			Used=TheScene.SendMessageToDescendants(CMView.MESSAGE_MOUSE_MOVE,{TheView:this,RefX:RefX,RefY:RefY,TheEvent:TheEvent});
//			Used=this.GetParent(CMScene).MouseMove(this,RefX,RefY,TheEvent);
		}
	}
	return(Used);
}
/**
* Handles a mouse move up in the view.  Can be overriden to place items in the view
* and have the user interact with them.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseUp=function(TheEvent)
{
	var Used=false;
		
	if (!TheEvent) { TheEvent=window.event; }
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;
	
	if (this.Dragging)
	{
		this.DragX=0;
		this.DragY=0;
		this.Dragging=false;
	}
	else //if (this.CurrentTool==CMView.TOOL_INFO)
	{
		var RefX=this.GetRefXFromPixelX(PixelX);
		var RefY=this.GetRefYFromPixelY(PixelY);
		
		if (this.ToolHandler!=null)
		{
			Used=this.ToolHandler.MouseUp(this,RefX,RefY,TheEvent);
		}
		if (Used==false)
		{
			var TheScene=this.GetParent(CMScene);
			
			Used=TheScene.SendMessageToDescendants(CMView.MESSAGE_MOUSE_UP,{TheView:this,RefX:RefX,RefY:RefY,TheEvent:TheEvent});
//			Used=this.GetParent(CMScene).MouseUp(this,RefX,RefY,TheEvent);
		}
	}
	return(Used);

}
/**
* Handles a mouse wheel event.  Can be overriden to change the action taken when the 
* user moves the wheel.
* @protected
* @override
* @returns Flag - returns True if the function "used" the event so other stuff does not use it.
*/
CMView2D.prototype.MouseWheel=function(TheEvent)
{
	var Used=false;
	
	CMMainContainer.HidePopupWindows();
	
	if (!TheEvent) { TheEvent=window.event; }
	
	var Delta=TheEvent.detail? TheEvent.detail*(-120) : TheEvent.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
	
	if (Delta!=0)	
	{
		// get the current position of the mouse
		
		var NewZoomLevel=this.ZoomLevel;
		
		if (Delta>0)
		{
			NewZoomLevel=NewZoomLevel+1;
		}
		else
		{
			NewZoomLevel=NewZoomLevel-1;
		}
		
		var MinZoom=this.GetSetting("View2D","MinZoom");
		var MaxZoom=this.GetSetting("View2D","MaxZoom");
		
		if (NewZoomLevel<MinZoom) NewZoomLevel=MinZoom;
		if (NewZoomLevel>MaxZoom) NewZoomLevel=MaxZoom;
	
		if (NewZoomLevel!=this.ZoomLevel)
		{
			// find the position to zoom to
			
			var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,this.TheCanvasElement);
			var MousePixelX=Coordinate.x;
			var MousePixelY=Coordinate.y;
			
			var MouseRefX=this.GetRefXFromPixelX(MousePixelX);
			var MouseRefY=this.GetRefYFromPixelY(MousePixelY);
			
			this.ZoomLevel=NewZoomLevel;
			
			var NewMouseRefWidth=this.GetRefWidthFromPixelWidth(MousePixelX);
			var NewMouseRefHeight=this.GetRefHeightFromPixelHeight(MousePixelY);
			
			this.RefX=MouseRefX-NewMouseRefWidth; // subtract from the mouse back to the left (west)
			this.RefY=MouseRefY-NewMouseRefHeight; // add the height to move up to the north
			
			CMDataset.ResetRequests();
			
			this.Repaint();
		}
	}
	// prevent the wheele from scrolling the page
	
	if (TheEvent.preventDefault)  TheEvent.preventDefault()
	
	return(Used);
}
//******************************************************************
// CMView public functions
//******************************************************************
/**
* Converts the pixel coordinate from a mouse event into a string that
* is appropriate for display to the user
* @protected
* @TheEvent - the mouse event with clientX and clientY 
* @CoordinateUnits - CMUtilities.COORDINATE_UNITS for the string
* @returns Returns a string formatted in the specified coordinate units
*/
CMView2D.prototype.GetCoordinateStringFromEvent=function(TheEvent,CoordinateUnits)
{
	var TheCanvasElement=this.GetCanvasElement();
	
	var Coordinate=CMUtilities.GetElementCoordinate(TheEvent.clientX,TheEvent.clientY,TheCanvasElement);
	var PixelX=Coordinate.x;
	var PixelY=Coordinate.y;

	var RefX=this.GetRefXFromPixelX(PixelX);
	var RefY=this.GetRefYFromPixelY(PixelY);

	var TheProjector=this.GetParent(CMMainContainer).GetProjector();
	
	var Text=CMUtilities.GetCoordinateString(RefX,RefY,CoordinateUnits,TheProjector,this);
	
	return(Text);
}

//******************************************************************
// CMView2D public functions for managing the spatial bounds and position
//******************************************************************
/**
* Returns the current extent of the viewing area in reference units
* @public
* @returns The reference bounds of the canvas map { XMin,XMax,YMin,YMax }
*/
CMView2D.prototype.GetBounds=function()
{
	var TheExtent={};
	
	var TheScale=this.GetScale();
	
	TheExtent.XMin=this.RefX;
	TheExtent.YMax=this.RefY;
	TheExtent.XMax=this.RefX+(this.TheCanvasElement.width*TheScale);
	TheExtent.YMin=this.RefY-(this.TheCanvasElement.height*TheScale);
	
	return(TheExtent);
}

/**
* Sets the center of the map to the specified coordinate
* @public
* @param RefX - 
* @param RefY - 
*/
CMView2D.prototype.SetRefCenter=function(RefX,RefY)
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvasElement.width*TheScale;
	var RefHeight=-this.TheCanvasElement.height*TheScale;
	
	this.RefX=RefX-(RefWidth/2);
	this.RefY=RefY-(RefHeight/2); // RefHeight<0 so this is additive

	var MaxBounds=this.GetSetting("View2D","MaxBounds");
	
	if (MaxBounds!=null)
	{
		if (this.RefX<MaxBounds.Xs[0]) this.RefX=MaxBounds.Xs[0];
		if (this.RefY>MaxBounds.Ys[1]) this.RefY=MaxBounds.Ys[1];
		
		if ((this.RefX+RefWidth)>MaxBounds.Xs[1]) this.RefX=MaxBounds.Xs[1]-RefWidth;
		if ((this.RefY+RefHeight)<MaxBounds.Ys[0]) this.RefY=MaxBounds.Ys[0]-RefHeight;
	}
	this.Repaint();
}
/**
* Returns the coordinate that is in the center of the view
* @public
* @returns Result - 
*/
CMView2D.prototype.GetRefCenter=function()
{
	var TheScale=this.GetScale();
	
	var RefWidth=this.TheCanvasElement.width*TheScale;
	var RefHeight=this.TheCanvasElement.height*TheScale;

	var Result={
		RefX:this.RefX+(RefWidth/2),
		RefY:this.RefY-(RefHeight/2)
	};
	
	return(Result);
}
/**
* Zooms the view to the specified bounds.  Selects a zoom level that will
* contain the entire map.
* @public
* @param NewBounds - 
*/
CMView2D.prototype.ZoomToBounds=function(NewBounds)
{
	if (NewBounds==null) 
	{
		alert("Sorry, you cannot call CMView2D.ZoomToBounds(NewBounds) with NewBounds=null.");
	}
	else
	{
		if ('Xs' in NewBounds)
		{
			NewBounds={
				XMin:NewBounds.Xs[0],
				XMax:NewBounds.Xs[1],
				YMin:NewBounds.Ys[0],
				YMax:NewBounds.Ys[1]
			}
		}
		var width=this.TheCanvasElement.width;
		var height=this.TheCanvasElement.height;	
		
		// Determine how much to TheScale our coordinates by
		var TheScale=Math.abs(NewBounds.XMax - NewBounds.XMin)/width;
		var yScale=Math.abs(NewBounds.YMax - NewBounds.YMin)/height;
		
		if (TheScale < yScale)  TheScale=yScale; // if xScale < yScale, use xScale, else use yScale
		
		// zoom out until we find a zoom level that is appropriate
		var OldZoomLevel=this.ZoomLevel;
		
		var MinZoom=this.GetSetting("View2D","MinZoom");
		var MaxZoom=this.GetSetting("View2D","MaxZoom");
		
		this.ZoomLevel=20;
//		this.ZoomLevel=Math.log2(TheScale);
		if (this.ZoomLevel>MaxZoom) this.ZoomLevel=MaxZoom;
		if (this.ZoomLevel<MinZoom) this.ZoomLevel=MinZoom;
		
		while ((this.GetScale()<TheScale)&&(this.ZoomLevel>MinZoom))
		{
			this.ZoomLevel--;
		}
		
		// reset the dataset requests if the zoom level changed
		if (this.ZoomLevel!=OldZoomLevel) // zoom level changed
		{
			CMDataset.ResetRequests();
		}
		// reset the center of the map to the center of the bounds
		var CenterRefX=(NewBounds.XMax+NewBounds.XMin)/2;
		var CenterRefY=(NewBounds.YMin+NewBounds.YMax)/2;
		
		this.SetRefCenter(CenterRefX,CenterRefY);
	}
}
/**
* Zoom to the maxum bounds that have been set in the veiw
* @public
*/
CMView2D.prototype.ZoomToMaxBounds=function()
{
	var TheBounds=this.GetSetting("View2D","MaxBounds");
	
	if (TheBounds==null)
	{
		var TheScene=this.GetParent(CMScene);
		
		TheBounds=TheScene.GetBounds();
		
		if (TheBounds==null)
		{
			var TheGeo=TheScene.GetGeo(0);
			var TheProjector=TheGeo.GetProjector();
			if (TheProjector!=null)
			{
				TheBounds=TheProjector.GetProjectedBounds();
			}
		}
	}
	if (TheBounds!=null) this.ZoomToBounds(TheBounds);
}
//*******************************************************************
// CMView2D public functions for managing the zoom level
//*******************************************************************

/*
* Zoom in to a higher resolution (map units are doubled relative to pixels)
* @public
*/
CMView2D.prototype.ZoomIn=function()
{
	this.ZoomTo(this.ZoomLevel+1);
}
/*
* Zoom in to a lower resolution (map units are halved relative to pixels)
* @public
*/
CMView2D.prototype.ZoomOut=function()
{
	this.ZoomTo(this.ZoomLevel-1);
}
/**
* Zoom to a specific zoom level.  This can be fractional value.
* @public
* @param ZoomLevel - desired zoom level, 1 is 1:1 pixels to reference units
*/
CMView2D.prototype.ZoomTo=function(ZoomLevel)
{
	var MinZoom=this.GetSetting("View2D","MinZoom");
	var MaxZoom=this.GetSetting("View2D","MaxZoom");
	
	if (ZoomLevel<MinZoom) ZoomLevel=MinZoom;
	if (ZoomLevel>MaxZoom) ZoomLevel=MaxZoom;
	
	if (ZoomLevel!=this.ZoomLevel)
	{
		var RefX=this.GetRefXFromPixelX(this.TheCanvasElement.width/2);
		var RefY=this.GetRefYFromPixelY(this.TheCanvasElement.height/2);
	
		this.ZoomLevel=ZoomLevel;
	
		CMDataset.ResetRequests();
		
		this.SetRefCenter(RefX,RefY); // calls Paint()
	}
}
/**
* Returns the current zoom level.  1 is one pixel per one map unit, doubles with each
* zoom in so 2 is two pixels per map unit, 3 is 4 pixels per map unit, 4 is 16 pixels per map unit, etc.
* @public
* @returns ZoomLevel
*/
CMView2D.prototype.GetZoomLevel=function()
{
	return(this.ZoomLevel);
}

//******************************************************************
// CMView2D public functions to convert from PixelXs to RefXs (geographic) and back.
//******************************************************************
/**
* Converts a horiziontal coordinate value to a horizontal pixel value
* @public
* @param RefX horiziontal coordinate value in reference coordinates
* @returns PixelX
*/
CMView2D.prototype.GetPixelXFromRefX=function(RefX) 
{
 	var PixelX;
	
	var TheScale=this.GetScale();
	PixelX=(RefX - this.RefX) / TheScale;
	
	return(PixelX);
}
/**
* Converts a vertical coordinate value to a vertical pixel value
* @public
* @param RefY vertical coordinate value in reference coordinates
* @returns PixelY
*/
CMView2D.prototype.GetPixelYFromRefY=function(RefY) 
{
 	var TheScale=this.GetScale();
	var PixelY=(this.RefY - RefY) / TheScale;
	
	return(PixelY);
};
/**
* Converts a horiziontal reference coordinate to a horizontal pixel coordinate value
* @public
* @param RefX horiziontal coordinate value in reference coordinates
* @param RefY vertical coordinate value in vertical coordinates
* @returns PixelCoordinate - { PixelX,PixelY }
*/
CMView2D.prototype.GetPixelFromRef=function(RefX,RefY) 
{
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Result=
	{
  		PixelX: PixelX,
 		PixelY: PixelY
 	}
	return(Result);
}
/**
* Converts a horiziontal reference width to a pixel width value
* @public
* @param RefWidth horiziontal reference value
* @returns PixelWidth -
*/
CMView2D.prototype.GetPixelWidthFromRefWidth=function(RefWidth) 
{
	var TheScale=this.GetScale();
 	var PixelWidth=RefWidth/TheScale;
	
	return(PixelWidth);
}
/**
* Converts a vertical reference height to a pixel height
* @public
* @param RefHeight vertical height in reference units
* @returns PixelHeight -
*/
CMView2D.prototype.GetPixelHeightFromRefHeight=function(RefHeight) 
{
	var TheScale=this.GetScale();
	var PixelHeight=-RefHeight/TheScale;
	
	return(PixelHeight);
}
//*******************************************************************
// Functions to convert from reference coordinates to pixel coordinates
//*******************************************************************
/**
* Converts a horiziontal reference width to a horizontal pixel width 
* @public
* @param PixelWidth horiziontal width in pixels 
* @returns RefWidth - horiziontal reference width
*/
CMView2D.prototype.GetRefWidthFromPixelWidth=function(PixelWidth) 
{
	var TheScale=this.GetScale();
 	var RefWidth=PixelWidth*TheScale;
	
	return(RefWidth);
}
/**
* Converts a vertical reference height to a vertical pixel widthheight
* @public
* @param PixelHeight vertical height in pixels 
* @returns RefHeight - vertical reference height
*/
CMView2D.prototype.GetRefHeightFromPixelHeight=function(PixelHeight) 
{
	var TheScale=this.GetScale();
 	var RefHeight=-PixelHeight*TheScale;
	
	return(RefHeight);
}
/**
* Converts a horiziontal reference value to a horizontal pixel value 
* @public
* @param PixelX horiziontal coordinate value in pixels 
* @returns RefX - horiziontal reference coordinate value
*/
CMView2D.prototype.GetRefXFromPixelX=function(PixelX) 
{
	var TheScale=this.GetScale();
	var RefX=PixelX*TheScale+this.RefX;
	
	return(RefX);
};
/**
* Converts a vertical reference value to a vertical pixel value 
* @public
* @param PixelY vertical coordinate value in pixels 
* @returns RefY - vertical reference coordinate value
*/
CMView2D.prototype.GetRefYFromPixelY=function(PixelY) 
{
	var TheScale=this.GetScale();
	var RefY=-(PixelY*TheScale-this.RefY);
	
	return(RefY);
};

//*******************************************************************
// CMView2D public functions to paint simple graphic elements with reference coordinates
//*******************************************************************
CMView2D.prototype.SetStyle=function(NewStyle,SaveCurrentStyle) 
{
	CMView.SetStyleToContext(NewStyle,SaveCurrentStyle,this.TheContext,this);
}

/**
* Paints a rectangle based on the bounds.
* @public
* @param TheBounds
*/
CMView2D.prototype.PaintRefBounds=function(TheBounds)
{
	this.PaintRefRect(TheBounds.XMin,TheBounds.XMax,TheBounds.YMin,TheBounds.YMax);
}
/**
* Paints a rectangle based on the specified bounds.
* @public
* @param XMin - left edge of the rectangle
* @param XMax - right edge of the rectangle
* @param YMin - top edge of the rectangle
* @param YMax - bottom edge of the rectangle
*/
CMView2D.prototype.PaintRefRect=function(XMin,XMax,YMin,YMax)
{
	var Result=this.GetPixelFromRef(XMin,YMax);
	var PixelXMin=Result.PixelX;
	var PixelYMin=Result.PixelY;
	
	var Result=this.GetPixelFromRef(XMax,YMin);
	var PixelXMax=Result.PixelX;
	var PixelYMax=Result.PixelY;
	
	this.PaintRect(PixelXMin,PixelXMax,PixelYMin,PixelYMax);
};
/**
* Paint an arc using reference coordinates.  Can paint a circle by specifying
* a StartAngle of 0 and an End angle of Math.PI*2
* @public
* @param XMin - left edge of the rectangle
* @param XMax - right edge of the rectangle
* @param YMin - top edge of the rectangle
* @param YMax - bottom edge of the rectangle
* @param StartAngle - start of the arc in radians, 0 is up
* @param EndAngle - end of the arc in radians
*/
CMView2D.prototype.PaintRefArc=function(XMin,XMax,YMin,YMax,StartAngle,EndAngle)
{
	var Result=this.GetPixelFromRef(XMin,YMax);
	var PixelXMin=Result.PixelX;
	var PixelYMin=Result.PixelY;
	
	var Result=this.GetPixelFromRef(XMax,YMin);
	var PixelXMax=Result.PixelX;
	var PixelYMax=Result.PixelY;
	
	this.PaintArc(PixelXMin,PixelXMax,PixelYMin,PixelYMax,StartAngle,EndAngle);
};
/**
* Paint a rounded rectangle using reference coordinates
* @public
* @param XMin - left edge of the rectangle
* @param XMax - right edge of the rectangle
* @param YMin - top edge of the rectangle
* @param YMax - bottom edge of the rectangle
* @param RefXRadius - width/2 of the retangle containing the arc.
* @param RefYRadius - height/2 of the retangle containing the arc.
*/
CMView2D.prototype.PaintRefRoundedRect=function(XMin,XMax,YMin,YMax,RefXRadius,RefYRadius) 
{
	var Result=this.GetPixelFromRef(XMin,YMax);
	var PixelXMin=Result.PixelX;
	var PixelYMin=Result.PixelY;
	
	var Result=this.GetPixelFromRef(XMax,YMin);
	var PixelXMax=Result.PixelX;
	var PixelYMax=Result.PixelY;
	
	var PixelXRadius=this.GetPixelWidthFromRefWidth(RefXRadius);
	var PixelYRadius=this.GetPixelWidthFromRefWidth(RefYRadius);
	
	this.PaintRoundedRect(PixelXMin,PixelXMax,PixelYMin,PixelYMax,PixelXRadius,PixelYRadius);
}
/**
* Function to draw a circle from a reference coordinate
* @public
* @param X
* @param Y
* @param RadiusInPixels
*/
CMView2D.prototype.PaintRefCircle=function(X,Y,RadiusInPixels)
{
	var Result=this.GetPixelFromRef(X,Y);
	var XInPixels=Result.PixelX;
	var YInPixels=Result.PixelY;
	
	this.PaintCircle(XInPixels,YInPixels,RadiusInPixels);
};
/**
* Function to draw text using reference coordinates
* @public
* @param X
* @param Y
* @param Text
* @param Centered = optional, true to center
*/
/*
CMView2D.prototype.PaintRefText=function(X,Y,Text,Centered,RadAngle)
{
	var Result=this.GetPixelFromRef(X,Y);
	var XInPixels=Result.PixelX;
	var YInPixels=Result.PixelY;
	var Offset=0;
	
	if (Centered===true)
	{
		var TextWidth=this.TheContext.measureText(Text).width;
		
		Offset=(TextWidth/2);
	}
	if (RadAngle!=undefined)
	{
		this.TheContext.translate(XInPixels,YInPixels);
		this.TheContext.rotate(RadAngle);
	
		this.TheContext.fillText(Text,-Offset,0);
	
		this.TheContext.rotate(-RadAngle);
		this.TheContext.translate(-XInPixels,-YInPixels);
	}
	else
	{
		this.TheContext.fillText(Text,XInPixels-Offset,YInPixels);
	}
}*/
/**
* Draw text using reference a reference coordinate.  The coordinate is the left side
* of the baseline for the text.  If collision checking is enabled, only text that does
* not collide will be painted.
* @public
* @param Text - String of text to draw
* @param RefX - left side of the baseline
* @param RefY - vertical position of the baseline
* @param FontSize - Height of the font in pixels, required for bounds checking to work properly
* @param HAlign - horizontal alignment.  Left is the default, "right" and "center" also supported
* @param RadAngle - angle of the text.  Horizontal is the default, PI/2 and -PI/2 are also supported.
*/
CMView2D.prototype.PaintRefText=function(Text,RefX,RefY,FontSize,HAlign,RadAngle)
{
	var TextWidth=this.GetTextWidthInPixels(Text);
	
	var RefTextWidth=this.GetRefWidthFromPixelWidth(TextWidth);
	
	if (RadAngle===undefined) RadAngle=0;
	
	// find the lower left corner of the text
	
	// assume we are left justified with no rotation
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Bounds;
	
	if (RadAngle===0) // not rotated
	{
		if (HAlign==="center")
		{
			PixelX=this.GetPixelXFromRefX(RefX-(RefTextWidth/2));
		}
		else if (HAlign==="right")
		{
			PixelX=this.GetPixelXFromRefX(RefX-RefTextWidth);
		}
		else // must be left aligned
		{
		}
		Bounds={
			XMin:PixelX,
			XMax:PixelX+TextWidth,
			YMin:PixelY-FontSize,
			YMax:PixelY
		};
	
	}
	else if (RadAngle===Math.PI/2) // rotated 90 degrees clockwise
	{
		PixelX=this.GetPixelXFromRefX(RefX);
		
		if (HAlign==="center")
		{
			PixelY=this.GetPixelYFromRefY(RefY+(RefTextWidth/2));
		}
		else if (HAlign==="right")
		{
			PixelY=this.GetPixelYFromRefY(RefY+RefTextWidth);
		}
		else // must be left aligned
		{
			PixelY=this.GetPixelYFromRefY(RefY);
		}
		Bounds={
			XMin:PixelX,
			XMax:PixelX+FontSize,
			YMin:PixelY,
			YMax:PixelY+TextWidth
		};
	}
	else if (RadAngle===-Math.PI/2) // rotated 90 degrees counter-clockwise
	{
		PixelX=this.GetPixelXFromRefX(RefX);
		
		if (HAlign==="center")
		{
			PixelY=this.GetPixelYFromRefY(RefY-(RefTextWidth/2));
		}
		else if (HAlign==="right")
		{
			PixelY=this.GetPixelYFromRefY(RefY-RefTextWidth);
		}
		else // must be left aligned
		{
			PixelY=this.GetPixelYFromRefY(RefY);
		}
		Bounds={
			XMin:PixelX-FontSize,
			XMax:PixelX,
			YMin:PixelY-TextWidth,
			YMax:PixelY
		};
	}
	else
	{
		Bounds={
			XMin:PixelX-TextWidth,
			XMax:PixelX,
			YMin:PixelY-TextWidth,
			YMax:PixelY
		};
	}
/*	if (false) // debugging
	{
		this.SaveStyle();
		
		this.SetStyle({fillStyle:"rgba(0,0,0,0)",strokeStyle:"red"});
		
		this.PaintRect(Bounds.XMin,Bounds.XMax,Bounds.YMin,Bounds.YMax);
		
		this.RestoreStyle();
	}
*/	if (this.CheckCollision(Bounds)==false)
	{
		this.AddToCollisions(Bounds);
	
		this.PaintText(PixelX,PixelY,Text,RadAngle); // different
	}
}
/**
* Function to draw a line between two reference coordinates
* @public
* @param X1 - horizontal value for first coordinate
* @param Y1 - vertical value for first coordinate
* @param X2 - horizontal value for second coordinate
* @param Y2 - vertical value for second coordinate
*/
CMView2D.prototype.PaintRefLine=function(X1,Y1,X2,Y2)
{
	var Result=this.GetPixelFromRef(X1,Y1);
	var XInPixels1=Result.PixelX;
	var YInPixels1=Result.PixelY;
	
	var Result=this.GetPixelFromRef(X2,Y2);
	var XInPixels2=Result.PixelX;
	var YInPixels2=Result.PixelY;
	
	this.TheContext.beginPath();
	this.TheContext.moveTo(XInPixels1,YInPixels1);
	this.TheContext.lineTo(XInPixels2,YInPixels2);
	this.TheContext.stroke();
}

/**
* Function to paint a polygon.
* @public
* @param Xs - array of horiziontal coordinate values in reference units
* @param Ys
* @param Closed - true to close the polygon (filled)
* @param Fill - true to fill the polygon
* @param Stroke - true to stroke (outline) the polygon
*/
CMView2D.prototype.PaintRefPoly=function(Xs,Ys,Closed,Fill,Stroke)
{
	if (Xs!=undefined) // have coordinates
	{
		this.TheContext.beginPath();
		// create the path
		this.CreatePath(Xs,Ys,Closed);
		
		this.PaintPath(Closed,Fill,Stroke);
	}
}

/**
* Function to paint an area.
* @public
* @param TheArea - array of polygons
* @param Closed - true to close the area (filled)
* @param Fill - true to fill the area
* @param Stroke - true to stroke (outline) the area
*/
CMView2D.prototype.PaintRefArea=function(TheArea,Closed,Fill,Stroke)
{
	if ((TheArea!=undefined)&&(TheArea.length>0))
	{
			this.TheContext.beginPath();
		// paint the exterior poly
		this.CreatePath(TheArea[0][0],TheArea[0][1],Closed);
		
		// paint any interior polys (have to be in the reverse direction
		for (var i=1;i<TheArea.length;i++)
		{
			var Xs=TheArea[i][0];
			var Ys=TheArea[i][1];
			
			this.CreatePath(Xs,Ys,Closed,Fill,Stroke);
		}
		// paint the resulting path
		this.PaintPath(Closed,Fill,Stroke);
	}
}
/**
* Function to paint a region.
* @public
* @param TheArea - array of regions
* @param Closed - true to close the region (filled)
* @param Fill - true to fill the region
* @param Stroke - true to stroke (outline) the region
*/
CMView2D.prototype.PaintRefRegion=function(TheRegion,Closed,Fill,Stroke)
{
	if (TheRegion!=undefined)
	{
		for (var i=0;i<TheRegion.length;i++)
		{
			this.PaintRefArea(TheRegion[i],Closed,Fill,Stroke);
		}
	}
}

//**********************************************************
// CMView2D public functions to paint raster data with reference coordinates
//**********************************************************

/**
* Function to paint an image using reference coordinates
* @public
* @param TheImage - 
* @param RefX - Left side of the image
* @param RefY
*/
CMView2D.prototype.PaintRefImage=function(TheImage,RefX,RefY) 
{
	var Result=this.GetPixelFromRef(RefX,RefY);
	var XInPixels1=Result.PixelX;
	var YInPixels1=Result.PixelY;
	
	this.TheContext.drawImage(TheImage,XInPixels1,YInPixels1);
}
/*
* Function to draw a raster using a bounding box in reference coordinates
* The second parameter may be a RefX or a Bounds object.
* @public
* @param TheImage - 
* @param RefX - Left side of the image or a bound box
* @param RefY - Top of the image
* @param RefWidth - width of the image
* @param RefHeight
*/
CMView2D.prototype.PaintRefImageScaled=function(TheImage,RefX,RefY,RefWidth,RefHeight)
{
	var Type=typeof(RefX);
	
	if (Type=="object")
	{
		TheBounds=RefX;
		
		RefX=TheBounds.XMin;
		RefY=TheBounds.YMax;
		RefWidth=TheBounds.XMax-TheBounds.XMin;
		RefHeight=TheBounds.YMin-TheBounds.YMax;
	}
	
	var Result=this.GetPixelFromRef(RefX,RefY);
	var XInPixels1=Math.round(Result.PixelX);
	var YInPixels1=Math.round(Result.PixelY);
	
	var PixelWidth=this.GetPixelWidthFromRefWidth(RefWidth);
	var PixelHeight=this.GetPixelHeightFromRefHeight(RefHeight);
	
	PixelWidth=Math.round(PixelWidth);
	PixelHeight=Math.round(PixelHeight);
	
	// jjg - the +1 is a bit of a kluge but it keeps the tiles from having spaces between them because of rounding errors
	this.TheContext.drawImage(TheImage,XInPixels1,YInPixels1,PixelWidth+1,PixelHeight+1); 
}

//**********************************************************
// CMView2D functions to create windows from the viewing area
//**********************************************************
/**
* Creates an info popup window and displays the specific HTML.
* @public
* @param ID
* @param RefX
* @param RefY
* @param WindowWidth
* @param WindowHeight
* @param TheHTML
*/
CMView2D.prototype.CreateInfoWindow=function(ID,RefX,RefY,WindowWidth,WindowHeight,TheHTML)
{
	var PixelX=this.GetPixelXFromRefX(RefX);
	var PixelY=this.GetPixelYFromRefY(RefY);
	
	var Offset=jQuery(this.TheCanvasElement).offset();
	
	var CanvasBounds=this.TheCanvasElement.getBoundingClientRect();
	PixelX+=CanvasBounds.left;
	PixelY+=CanvasBounds.top;
	
	var TheCanvasMap=this.GetParent(CMMainContainer);
	var TheImageFolder=TheCanvasMap.GetSetting("MainContainer","ImageFolder");
	
	var InfoWindow=CMUtilities.CreateInfoWindow(ID,PixelX,PixelY,WindowWidth,WindowHeight,TheHTML,TheImageFolder);

	return(InfoWindow);
}


