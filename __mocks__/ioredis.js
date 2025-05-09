// Mock for ioredis
class Redis {
  constructor(options) {
    this.options = options;
    this.commands = {};
    this.slaves = [];
  }
  
  set(key, value) { 
    this.commands[key] = value; 
    return Promise.resolve('OK'); 
  }

  get(key) { 
    return Promise.resolve(this.commands[key] || null); 
  }
  
  hset(key, field, data) { 
    return Promise.resolve(1); 
  }
  
  hget(key, field) { 
    return Promise.resolve(null); 
  }
  
  lpush(key, data) { 
    return Promise.resolve(1); 
  }
  
  lpop(key) { 
    return Promise.resolve(null); 
  }
  
  sadd(key, data) { 
    return Promise.resolve(1); 
  }
  
  spop(key) { 
    return Promise.resolve(null); 
  }
  
  zadd(key, score, data) { 
    return Promise.resolve(1); 
  }
  
  zrange(key, start, end) { 
    return Promise.resolve([]); 
  }
  
  slaveof(host, port) { 
    this.slaves.push({host, port}); 
    return Promise.resolve('OK'); 
  }
  
  config(cmd, key, value) {
    if (cmd === 'SET') { 
      this.commands[key] = value; 
      return Promise.resolve('OK'); 
    }

    if (cmd === 'GET') { 
      return Promise.resolve([key, this.commands[key] || null]); 
    }
    
    return Promise.resolve(null);
  }
  
  info(section) {
    if (section === 'persistence') return Promise.resolve('rdb_bgsave_in_progress:0');
    
    if (section === 'server') {
      const tlsEnabled = this.commands['tls-port'] ? 'tls_enabled:1' : 'tls_enabled:0';
      const authClients = `tls_auth_clients:unknown`;
      return Promise.resolve(`${tlsEnabled}\n${authClients}`);
    }
    
    return Promise.resolve('');
  }
  
  bgsave() { 
    return Promise.resolve('OK'); 
  }
  
  save() { 
    return Promise.resolve('OK'); 
  }
  
  disconnect() { 
    return Promise.resolve(); 
  }
}

module.exports = Redis;
