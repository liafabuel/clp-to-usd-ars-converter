import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ExchangeRates {
  USD: number;
  ARS: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://open.exchangerate-api.com/v6/latest/CLP');
      if (!response.ok) throw new Error('Error al obtener tasas');
      const data = await response.json();
      setRates({
        USD: data.rates.USD,
        ARS: data.rates.ARS,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError('No se pudieron cargar las tasas de cambio');
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

  const numericAmount = parseInt(amount) || 0;
  const usdAmount = rates ? numericAmount * rates.USD : 0;
  const arsAmount = rates ? numericAmount * rates.ARS : 0;

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
            inputMode="numeric"
            placeholder="0"
            value={formatCLP(amount)}
            onChange={handleAmountChange}
            className="input-glass text-3xl font-semibold pl-10 pr-4 py-6 h-auto text-foreground"
          />
        </div>
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
              <span className="currency-badge currency-badge-ars">ARS</span>
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
                1 CLP = {rates.ARS.toFixed(4)} ARS
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
        {lastUpdated && (
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
