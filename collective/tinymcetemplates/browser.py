try:
    import json
except ImportError:
    import simplejson as json

import os

from zope.component import queryUtility
from zope.publisher.browser import BrowserView

from plone.registry.interfaces import IRegistry

try:
    from Products.ATContentTypes.interfaces.document import IATDocument
except:
    from Products.ATContentTypes.interface import IATDocument

try:
    from Products.ATContentTypes.interfaces.folder import IATFolder
except:
    from Products.ATContentTypes.interface import IATFolder

from Products.CMFCore.utils import getToolByName

class TemplateList(BrowserView):
    
    def __call__(self):
        
        self.request.response.setHeader('Content-Type', 'text/javascript')
        
        registry = queryUtility(IRegistry)
        templates = {}
        
        if registry is not None:
            templateDirectories = registry.get('collective.tinymcetemplates.templateLocations', None)
            if templateDirectories:
                
                portal_catalog = getToolByName(self.context, 'portal_catalog')
                portal_url = getToolByName(self.context, 'portal_url')
                
                portal_path = '/'.join(portal_url.getPortalObject().getPhysicalPath())
                paths = []
                for p in templateDirectories:
                    if p.startswith('/'):
                        p = p[1:]
                    paths.append("%s/%s" % (portal_path, p,))

                for r in portal_catalog(path=paths, object_provides=IATDocument.__identifier__):
                    tp = os.path.dirname(r.getPath())
                    f = portal_catalog(path=tp, object_provides=IATFolder.__identifier__)
                    if not templates.has_key(f[0].Title):
                        templates[f[0].Title] = []
                    templates[f[0].Title].append([r.Title, "%s/getText" % r.getURL(), r.Description])
        
        return u"var tinyMCETemplateList = %s;" % json.dumps(templates)
