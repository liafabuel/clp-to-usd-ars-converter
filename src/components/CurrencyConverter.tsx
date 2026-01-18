import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown, AlertCircle, X, Settings, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ExchangeRates {
  USD: number;
  ARS: number;
}

interface CachedRates {
  rates: ExchangeRates;
  timestamp: string;
}

const STORAGE_KEY = 'currency_rates_cache';
const SETTINGS_KEY = 'currency_settings';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineTimestamp, setOfflineTimestamp] = useState<string | null>(null);
  
  // ARS adjustment settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [arsAdjustmentEnabled, setArsAdjustmentEnabled] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.arsAdjustmentEnabled ?? false;
    }
    return false;
  });
  const [arsMultiplier, setArsMultiplier] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.arsMultiplier ?? '2.0';
    }
    return '2.0';
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      arsAdjustmentEnabled,
      arsMultiplier,
    }));
  }, [arsAdjustmentEnabled, arsMultiplier]);

  const saveRatesToCache = (rates: ExchangeRates) => {
    const cache: CachedRates = {
      rates,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  };

  const loadRatesFromCache = (): CachedRates | null => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  };

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsOffline(false);
    try {
      const response = await fetch('https://open.exchangerate-api.com/v6/latest/CLP');
      if (!response.ok) throw new Error('Error al obtener tasas');
      const data = await response.json();
      const newRates = {
        USD: data.rates.USD,
        ARS: data.rates.ARS,
      };
      setRates(newRates);
      setLastUpdated(new Date());
      saveRatesToCache(newRates);
    } catch (err) {
      // Try to load from cache
      const cached = loadRatesFromCache();
      if (cached) {
        setRates(cached.rates);
        setIsOffline(true);
        setOfflineTimestamp(cached.timestamp);
        setError(null);
      } else {
        setError('No se pudieron cargar las tasas de cambio');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleClearAmount = () => {
    setAmount('');
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setArsMultiplier(value);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCLP = (value: string) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-CL').format(parseInt(value));
  };

  const formatOfflineDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const numericAmount = parseInt(amount) || 0;
  const usdAmount = rates ? numericAmount * rates.USD : 0;
  const multiplierValue = parseFloat(arsMultiplier) || 1;
  const arsBaseAmount = rates ? numericAmount * rates.ARS : 0;
  const arsAmount = arsAdjustmentEnabled ? arsBaseAmount * multiplierValue : arsBaseAmount;

  const quickAmounts = [1000, 5000, 10000];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Conversor de Moneda
        </h1>
        <p className="text-muted-foreground text-sm">
          Convierte CLP a USD y ARS en tiempo real
        </p>
      </div>

      {/* Offline Banner */}
      {isOffline && offlineTimestamp && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <p className="text-xs text-yellow-500">
            Modo Offline: Usando tasas del {formatOfflineDate(offlineTimestamp)}
          </p>
        </div>
      )}

      {/* Settings Collapsible */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="mb-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración ARS
            </span>
            <span className="text-xs">
              {arsAdjustmentEnabled ? `Ajuste: x${arsMultiplier}` : 'Desactivado'}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ars-adjustment" className="text-sm text-foreground">
                Multiplicador de Ajuste
              </Label>
              <Switch
                id="ars-adjustment"
                checked={arsAdjustmentEnabled}
                onCheckedChange={setArsAdjustmentEnabled}
              />
            </div>
            {arsAdjustmentEnabled && (
              <div className="space-y-2">
                <Label htmlFor="multiplier" className="text-xs text-muted-foreground">
                  Factor (ej: 2.0 para Dólar Blue/Tarjeta)
                </Label>
                <Input
                  id="multiplier"
                  type="text"
                  inputMode="decimal"
                  value={arsMultiplier}
                  onChange={handleMultiplierChange}
                  className="input-glass text-lg font-semibold"
                  placeholder="2.0"
                />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Input Card */}
      <div className="glass-card p-6 mb-4 glow-effect">
        <div className="flex items-center justify-between mb-4">
          <span className="currency-badge currency-badge-clp">CLP</span>
          <span className="text-xs text-muted-foreground">Peso Chileno</span>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
            $
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={formatCLP(amount)}
            onChange={handleAmountChange}
            className="input-glass text-3xl font-semibold pl-10 pr-12 py-6 h-auto text-foreground"
          />
          {amount && (
            <button
              onClick={handleClearAmount}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Limpiar monto"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Amounts */}
      <div className="flex gap-2 mb-4 justify-center">
        {quickAmounts.map((quickAmount) => (
          <Button
            key={quickAmount}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(quickAmount)}
            className="border-primary/30 text-primary hover:bg-primary/10 text-xs"
          >
            ${formatNumber(quickAmount, 0)}
          </Button>
        ))}
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <ArrowDown className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="glass-card p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-destructive text-sm mb-4">{error}</p>
          <Button 
            onClick={fetchRates} 
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* USD Result */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="currency-badge currency-badge-usd">USD</span>
              <span className="text-xs text-muted-foreground">Dólar Estadounidense</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground text-xl">$</span>
              <span className="text-3xl font-bold" style={{ color: 'hsl(142 71% 45%)' }}>
                {loading ? '...' : formatNumber(usdAmount)}
              </span>
            </div>
            {rates && (
              <p className="text-xs text-muted-foreground mt-2">
                1 CLP = {rates.USD.toFixed(6)} USD
              </p>
            )}
          </div>

          {/* ARS Result */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="currency-badge currency-badge-ars">ARS</span>
                {arsAdjustmentEnabled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-ars/20 text-ars font-medium">
                    Ajustado x{arsMultiplier}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Peso Argentino</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-muted-foreground text-xl">$</span>
              <span className="text-3xl font-bold" style={{ color: 'hsl(217 91% 60%)' }}>
                {loading ? '...' : formatNumber(arsAmount)}
              </span>
            </div>
            {rates && (
              <p className="text-xs text-muted-foreground mt-2">
                1 CLP = {(rates.ARS * (arsAdjustmentEnabled ? multiplierValue : 1)).toFixed(4)} ARS
                {arsAdjustmentEnabled && (
                  <span className="text-ars/70"> (ajustado)</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button
          onClick={fetchRates}
          disabled={loading}
          variant="ghost"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar tasas
        </Button>
        {lastUpdated && !isOffline && (
          <p className="text-xs text-muted-foreground">
            Última actualización: {lastUpdated.toLocaleTimeString('es-CL')}
          </p>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Datos de ExchangeRate-API
      </p>
    </div>
  );
};

export default CurrencyConverter;
