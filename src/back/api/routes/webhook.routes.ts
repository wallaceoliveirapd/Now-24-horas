import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../../services/payment.service';
import { mercadoPagoService } from '../../services/mercadopago.service';

const router = Router();

/**
 * POST /api/webhooks/mercadopago
 * Receber webhook do Mercado Pago
 * 
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
router.post('/mercadopago', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-signature'] as string | undefined;
    const data = req.body;

    console.log('📥 Webhook recebido do Mercado Pago:', {
      type: data.type,
      action: data.action,
      dataId: data.data?.id,
      signature: signature ? 'presente' : 'ausente',
    });

    // Validar webhook básico
    const isValid = mercadoPagoService.validateWebhook(data, signature);
    if (!isValid) {
      console.warn('⚠️  Webhook não passou na validação básica');
      // Continuar mesmo assim, validaremos via API
    }

    // Processar webhook conforme tipo
    if (data.type === 'payment') {
      const paymentId = data.data?.id;
      
      if (paymentId) {
        // Validar webhook consultando a API (mais seguro)
        const isValidViaAPI = await mercadoPagoService.validateWebhookViaAPI(paymentId.toString());
        
        if (!isValidViaAPI) {
          console.error('❌ Webhook inválido - pagamento não encontrado na API');
          return res.status(200).json({ 
            success: false, 
            message: 'Webhook inválido - pagamento não encontrado' 
          });
        }

        // Obter dados atualizados do pagamento
        const payment = await mercadoPagoService.getPayment(paymentId.toString());
        
        console.log('💳 Processando pagamento:', {
          id: payment.id,
          status: payment.status,
          statusDetail: (payment as any).status_detail,
        });
        
        // Atualizar transação
        await paymentService.updateTransactionStatus(
          paymentId.toString(),
          payment.status || 'pending',
          payment
        );

        console.log('✅ Webhook processado com sucesso');
      } else {
        console.warn('⚠️  Webhook sem ID de pagamento');
      }
    } else if (data.type === 'merchant_order') {
      // Processar atualizações de pedido do Mercado Pago
      console.log('📦 Webhook de merchant_order recebido:', data.data?.id);
      // Implementar lógica se necessário
    } else {
      console.log('ℹ️  Tipo de webhook não processado:', data.type);
    }

    // Sempre retornar 200 para evitar retentativas do Mercado Pago
    res.status(200).json({ success: true, message: 'Webhook processado' });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Retornar 200 mesmo em caso de erro para evitar retentativas do Mercado Pago
    res.status(200).json({ success: false, message: 'Erro ao processar webhook' });
  }
});

export { router as webhookRoutes };

