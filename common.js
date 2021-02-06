
function popup2(x,y,z) {
	var wi = window.open(x,y,'left=1,top=1,'+z);
}

String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)}

function initPage(id) {
	if ('#last' == window.location.hash) {
		var articles = document.getElementsByTagName('article');
		if (articles.length > 1) {
			window.location.hash = '#' + articles[articles.length-1].id;
		}
	}
	if (id == undefined) {
		var pathname = window.location.pathname; 
		var nav = document.getElementById('nav');
		var links = nav.getElementsByTagName('a');
		var linksLength = links.length;
		for (var i = 0; i < linksLength; i++) {
			var p = links[i].pathname;
			if (p.charAt(0)!='/') p = '/'+p;
    	if (!links[i].id.startsWith('rub') && pathname == p) {
				checkItemMenu(links[i]);
			}
		}
	}
	else {
		checkItemMenu(document.getElementById(id));
	}
}

function checkItemMenu(e) {
	e.className += ' sub-selected';
	var rubElem = e.parentNode.parentNode.parentNode.getElementsByTagName('a')[0];
	rubElem.className += ' rub-selected';
	var isNotOm = navigator.userAgent.indexOf('Opera Mini') < 0;
	if(isNotOm && typeof window.matchMedia == 'function' && window.matchMedia('screen and (max-width: 615px)').matches) {
		window.location.hash = '#' + rubElem.id;
	}
}


function zoom(url, source, comment) {
	zoomManager.show(url, source, comment);	
}

var zoomManager = {

	sources : ['moi', 'inconnue'],
	modalOverlay: 0,
	modalContent: 0,
	modalPreload: 0,
	modalNavPrev: 0,
	modalNavNext: 0,
	nextFigureCode: null,
	prevFigureCode: null,
	allAnchors: [],
	visible: false,
	show : function(url, source, comment) {
		this.visible = true;
		this.initialize();
		var curAnchor = this.getAnchorByZoomUrl(url); 
		if (comment == undefined && curAnchor && curAnchor.nextSibling && curAnchor.nextSibling.tagName && curAnchor.nextSibling.tagName.toUpperCase()=='FIGCAPTION') {
			if (curAnchor.nextSibling.innerHTML.length <= 120)
				comment = curAnchor.nextSibling.innerHTML;
		}
		//modalPreload.style.opacity = 0;
		modalContent.innerHTML=this.getImgZoomHtml(url, comment, source);
		//modalPreload.style.opacity = 1;
		this.nextFigureCode = this.getNextAnchor(curAnchor); 
		if (this.nextFigureCode !== null)
			modalNavNext.innerHTML='<a href="javascript:' + this.nextFigureCode + '" id="zoom-nav-next" class="zoom-nav-target"></a>';
		modalNavNext.style.visibility = this.nextFigureCode !== null ? 'visible' : 'hidden';

		this.prevFigureCode = this.getPrevAnchor(curAnchor);
		if (this.prevFigureCode !== null)	
			modalNavPrev.innerHTML='<a href="javascript:' + this.prevFigureCode + '" id="zoom-nav-prev" class="zoom-nav-target"></a>';
		modalNavPrev.style.visibility = this.prevFigureCode !== null ? 'visible' : 'hidden';
	},
	getSource : function (s) {
		return 'Source : '+(isNaN(s)?s:this.sources[s]);
	},
	initialize : function(hideNav) {
		if (typeof hideNav == undefined) {
			hideNav = false;
		}
		if (this.allAnchors.length == 0) {
			this.allAnchors = document.querySelectorAll("figure>a");
		}
		
		if (!document.getElementById('modal-overlay')) {
			modalOverlay=document.createElement('div');
			modalOverlay.setAttribute('id', 'modal-overlay');
			document.body.appendChild(modalOverlay);
		}
		if (!document.getElementById('modal-content')) {
			modalContent=document.createElement('div');
			modalContent.setAttribute('id', 'modal-content');
			document.body.appendChild(modalContent);
		}
		if (!document.getElementById('modal-preload')) {		
			modalPreload=document.createElement('div');
			modalPreload.setAttribute('id', 'modal-preload');
			document.body.appendChild(modalPreload);
		}
		if (!hideNav && !document.getElementById('modal-nav-prev')) {
			modalNavPrev=document.createElement('div');
			modalNavPrev.setAttribute('id', 'modal-nav-prev');
			document.body.appendChild(modalNavPrev);
		}
		if (!hideNav && !document.getElementById('modal-nav-next')) {
			modalNavNext=document.createElement('div');
			modalNavNext.setAttribute('id', 'modal-nav-next');
			document.body.appendChild(modalNavNext);
		}
	},
	
	getImgZoomHtml : function (url, comment, source) {
		return '<div class="zoom-table"><div class="zoom-cell">'
			+'<a href="javascript:zoomManager.hide()" id="zoom-lnk"><img src="'+url+'" title="Fermer" alt="Chargement en cours..." id="zoom-main-img"></a>'
			+'<div id="zoom-legend">'
			+(source ? '<div id="zoom-source">'+this.getSource(source)+'</div>':'')
			+(comment ? '<div id="zoom-comment">'+comment+'</div>':'')
			+'</div></div></div>';
	},
	
	hide : function() {
		if (this.visible) {
			this.nextFigureCode = null;
			this.prevFigureCode = null;
			with(document.body) {
				removeChild(modalPreload); removeChild(modalOverlay); removeChild(modalContent);
				if (document.getElementById('modal-nav-prev')) removeChild(modalNavPrev);
				if (document.getElementById('modal-nav-next')) removeChild(modalNavNext);
			}
		}
		this.visible = false;
	},

	getNextAnchor : function(r) {
		if (r) {
			for (var i = 0; i<this.allAnchors.length; i++) {
				if (this.allAnchors[i] == r) {
					if (i < (this.allAnchors.length-1)) {
						return this.extractCodeInAnchor(this.allAnchors[i+1]);
					}
				}
			}
		}
		return null;
	},

	getPrevAnchor : function(r) {
		if (r) {
			for (var i = 0; i<this.allAnchors.length; i++) {
				if (this.allAnchors[i] == r) {
					if (i > 0) {
						return this.extractCodeInAnchor(this.allAnchors[i-1]);
					}
				}
			}
		}
		return null;
	},

	extractCodeInAnchor : function(node) {
		if (node) {
			var href = node.getAttribute('href');
			var posInstr = href.indexOf('javascript:');
			if (posInstr>=0)
				return href.substring(posInstr+11);
		}
		return '';
	},

	getAnchorByZoomUrl : function(url) {
		var list=document.querySelectorAll("figure > a[href^=\"javascript:zoom('" + url + "'\"]");
		return list.length>0?list[0]:null;
	},
}

document.onkeydown = function(evt) {
	evt = evt || window.event;
	if (evt.keyCode == 27)
		zoomManager.hide();
	else if (evt.keyCode == 39)
		eval(zoomManager.nextFigureCode);
	else if (evt.keyCode == 37)
		eval(zoomManager.prevFigureCode);
};

Element.prototype.hasClassName = function(className) {
	return this.classList ? this.classList.contains(className) : !!this.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}
Element.prototype.addClass = function(className) {
	if (this.classList){this.classList.add(className);}
	else if (!this.hasClass(className)){this.className += " " + className;}
	return this;
}
Element.prototype.removeClass = function(className) {
	if (this.classList){this.classList.remove(className);}
	else if (this.hasClass(className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		this.className = this.className.replace(reg, ' ');
	}
	return this;
}
function toggleClass(e, c) {
	if (e.hasClassName(c))
		e.removeClass(c);
	else
		e.addClass(c);
}