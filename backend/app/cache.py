from __future__ import annotations
import time
from threading import Lock

class TTLCache:
    def __init__(self):
        self._data={}
        self._lock=Lock()

    def get(self,key):
        now=time.time()
        with self._lock:
            item=self._data.get(key)
            if not item:return None
            expires,value=item
            if expires<now:
                self._data.pop(key,None)
                return None
            return value

    def set(self,key,value,ttl_seconds):
        with self._lock:
            self._data[key]=(time.time()+ttl_seconds,value)

cache=TTLCache()
