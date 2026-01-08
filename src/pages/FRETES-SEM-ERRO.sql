-- =============================================
-- FRETES - SEM ERRO DE DUPLICADOS
-- =============================================

-- Adicionar colunas se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='fretes' AND column_name='capacidade_kg') THEN
        ALTER TABLE fretes ADD COLUMN capacidade_kg INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='fretes' AND column_name='preco_fixo') THEN
        ALTER TABLE fretes ADD COLUMN preco_fixo DECIMAL(10, 2);
    END IF;
END $$;

-- Deletar todos os dados antigos
DELETE FROM fretes WHERE ativo = TRUE;

-- Inserir fretes (se já existir, ATUALIZA ao invés de dar erro)

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ABAETE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1750.0, 14000, 1750.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1750.0,
    capacidade_kg = 14000,
    preco_fixo = 1750.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ALVORADA DE MINAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1650.0, 14000, 1650.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1650.0,
    capacidade_kg = 14000,
    preco_fixo = 1650.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARAÇAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 245.0, 14000, 245.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 245.0,
    capacidade_kg = 14000,
    preco_fixo = 245.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARCOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2000.0, 14000, 2000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2000.0,
    capacidade_kg = 14000,
    preco_fixo = 2000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BARREIRO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 590.0, 14000, 590.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 590.0,
    capacidade_kg = 14000,
    preco_fixo = 590.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BETANIA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 655.0, 14000, 655.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 655.0,
    capacidade_kg = 14000,
    preco_fixo = 655.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CALIFORNIA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 605.0, 14000, 605.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 605.0,
    capacidade_kg = 14000,
    preco_fixo = 605.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CENTRO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 520.0, 14000, 520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 520.0,
    capacidade_kg = 14000,
    preco_fixo = 520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - LAGOINHA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 480.0, 14000, 480.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 480.0,
    capacidade_kg = 14000,
    preco_fixo = 480.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - SAUDADE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 523.0, 14000, 523.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 523.0,
    capacidade_kg = 14000,
    preco_fixo = 523.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - VENDA NOVA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 425.0, 14000, 425.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 425.0,
    capacidade_kg = 14000,
    preco_fixo = 425.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BALDIM', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 755.0, 14000, 755.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 755.0,
    capacidade_kg = 14000,
    preco_fixo = 755.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARAO DE COCAIS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1270.0, 14000, 1270.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1270.0,
    capacidade_kg = 14000,
    preco_fixo = 1270.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARBACENA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1850.0, 14000, 1850.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1850.0,
    capacidade_kg = 14000,
    preco_fixo = 1850.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARROSO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1950.0, 14000, 1950.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1950.0,
    capacidade_kg = 14000,
    preco_fixo = 1950.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BELO VALE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1220.0, 14000, 1220.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1220.0,
    capacidade_kg = 14000,
    preco_fixo = 1220.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BETIM', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 755.0, 14000, 755.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 755.0,
    capacidade_kg = 14000,
    preco_fixo = 755.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BRUMADINHO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1000.0, 14000, 1000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1000.0,
    capacidade_kg = 14000,
    preco_fixo = 1000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CACHOEIRA DA PRATA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 720.0, 14000, 720.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 720.0,
    capacidade_kg = 14000,
    preco_fixo = 720.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETANOPOLIS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 755.0, 14000, 755.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 755.0,
    capacidade_kg = 14000,
    preco_fixo = 755.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 930.0, 14000, 930.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 930.0,
    capacidade_kg = 14000,
    preco_fixo = 930.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAMPO BELO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2000.0, 14000, 2000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2000.0,
    capacidade_kg = 14000,
    preco_fixo = 2000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAPIM BRANCO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 245.0, 14000, 245.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 245.0,
    capacidade_kg = 14000,
    preco_fixo = 245.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARANDAI', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1650.0, 14000, 1650.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1650.0,
    capacidade_kg = 14000,
    preco_fixo = 1650.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARDEAL MOTA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 855.0, 14000, 855.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 855.0,
    capacidade_kg = 14000,
    preco_fixo = 855.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARMESIA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1950.0, 14000, 1950.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1950.0,
    capacidade_kg = 14000,
    preco_fixo = 1950.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONCEICAO DO MATO DENTRO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1385.0, 14000, 1385.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1385.0,
    capacidade_kg = 14000,
    preco_fixo = 1385.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONFINS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 245.0, 14000, 245.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 245.0,
    capacidade_kg = 14000,
    preco_fixo = 245.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONGONHAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1270.0, 14000, 1270.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1270.0,
    capacidade_kg = 14000,
    preco_fixo = 1270.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONSELHEIRO LAFAIETE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1410.0, 14000, 1410.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1410.0,
    capacidade_kg = 14000,
    preco_fixo = 1410.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONTAGEM', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 590.0, 14000, 590.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 590.0,
    capacidade_kg = 14000,
    preco_fixo = 590.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORDISBURGO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 985.0, 14000, 985.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 985.0,
    capacidade_kg = 14000,
    preco_fixo = 985.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORINTO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1650.0, 14000, 1650.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1650.0,
    capacidade_kg = 14000,
    preco_fixo = 1650.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CURVELO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1385.0, 14000, 1385.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1385.0,
    capacidade_kg = 14000,
    preco_fixo = 1385.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DATAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1900.0, 14000, 1900.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1900.0,
    capacidade_kg = 14000,
    preco_fixo = 1900.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIAMANTINA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2000.0, 14000, 2000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2000.0,
    capacidade_kg = 14000,
    preco_fixo = 2000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIVINOPOLIS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DOM JOAQUIM', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1610.0, 14000, 1610.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1610.0,
    capacidade_kg = 14000,
    preco_fixo = 1610.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ENTRE RIOS DE MINAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1610.0, 14000, 1610.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1610.0,
    capacidade_kg = 14000,
    preco_fixo = 1610.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ESMERALDAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 730.0, 14000, 730.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 730.0,
    capacidade_kg = 14000,
    preco_fixo = 730.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FIDALGO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 280.0, 14000, 280.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 280.0,
    capacidade_kg = 14000,
    preco_fixo = 280.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FLORESTAL', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1035.0, 14000, 1035.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1035.0,
    capacidade_kg = 14000,
    preco_fixo = 1035.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORMIGA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1900.0, 14000, 1900.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1900.0,
    capacidade_kg = 14000,
    preco_fixo = 1900.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORTUNA DE MINAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 720.0, 14000, 720.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 720.0,
    capacidade_kg = 14000,
    preco_fixo = 720.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FUNILANDIA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 450.0, 14000, 450.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 450.0,
    capacidade_kg = 14000,
    preco_fixo = 450.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('GUANHAES', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1850.0, 14000, 1850.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1850.0,
    capacidade_kg = 14000,
    preco_fixo = 1850.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IBIRITE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 720.0, 14000, 720.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 720.0,
    capacidade_kg = 14000,
    preco_fixo = 720.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IGARAPE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 990.0, 14000, 990.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 990.0,
    capacidade_kg = 14000,
    preco_fixo = 990.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('INHAUMA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 920.0, 14000, 920.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 920.0,
    capacidade_kg = 14000,
    preco_fixo = 920.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IPATINGA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2000.0, 14000, 2000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2000.0,
    capacidade_kg = 14000,
    preco_fixo = 2000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1385.0, 14000, 1385.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1385.0,
    capacidade_kg = 14000,
    preco_fixo = 1385.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRITO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1035.0, 14000, 1035.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1035.0,
    capacidade_kg = 14000,
    preco_fixo = 1035.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAMBE DO MATO DENTRO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1440.0, 14000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 14000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAUNA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1230.0, 14000, 1230.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1230.0,
    capacidade_kg = 14000,
    preco_fixo = 1230.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JABOTICATUBAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 655.0, 14000, 655.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 655.0,
    capacidade_kg = 14000,
    preco_fixo = 655.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JECEABA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JEQUITIBA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 755.0, 14000, 755.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 755.0,
    capacidade_kg = 14000,
    preco_fixo = 755.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JOAO MONLEVADE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1405.0, 14000, 1405.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1405.0,
    capacidade_kg = 14000,
    preco_fixo = 1405.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JUATUBA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 990.0, 14000, 990.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 990.0,
    capacidade_kg = 14000,
    preco_fixo = 990.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LAGOA SANTA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 400.0, 14000, 400.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 400.0,
    capacidade_kg = 14000,
    preco_fixo = 400.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LUZ', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1950.0, 14000, 1950.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1950.0,
    capacidade_kg = 14000,
    preco_fixo = 1950.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIANA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1610.0, 14000, 1610.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1610.0,
    capacidade_kg = 14000,
    preco_fixo = 1610.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIO CAMPOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 930.0, 14000, 930.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 930.0,
    capacidade_kg = 14000,
    preco_fixo = 930.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARTINHO CAMPOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1610.0, 14000, 1610.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1610.0,
    capacidade_kg = 14000,
    preco_fixo = 1610.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATEUS LEME', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1035.0, 14000, 1035.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1035.0,
    capacidade_kg = 14000,
    preco_fixo = 1035.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATOZINHOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 245.0, 14000, 245.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 245.0,
    capacidade_kg = 14000,
    preco_fixo = 245.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MOCAMBEIRO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 245.0, 14000, 245.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 245.0,
    capacidade_kg = 14000,
    preco_fixo = 245.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MONTES CLAROS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2360.0, 14000, 2360.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2360.0,
    capacidade_kg = 14000,
    preco_fixo = 2360.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MORRO DO PILAR', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1230.0, 14000, 1230.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1230.0,
    capacidade_kg = 14000,
    preco_fixo = 1230.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA ERA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1610.0, 14000, 1610.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1610.0,
    capacidade_kg = 14000,
    preco_fixo = 1610.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 855.0, 14000, 855.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 855.0,
    capacidade_kg = 14000,
    preco_fixo = 855.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA - ALPHAVILLE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 855.0, 14000, 855.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 855.0,
    capacidade_kg = 14000,
    preco_fixo = 855.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ONCA DE PITANGUI', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO BRANCO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1440.0, 14000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 14000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1440.0, 14000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 14000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1440.0, 14000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 14000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PAPAGAIOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1140.0, 14000, 1140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1140.0,
    capacidade_kg = 14000,
    preco_fixo = 1140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARA DE MINAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1230.0, 14000, 1230.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1230.0,
    capacidade_kg = 14000,
    preco_fixo = 1230.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARACATU', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2730.0, 14000, 2730.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2730.0,
    capacidade_kg = 14000,
    preco_fixo = 2730.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARAOPEBA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 755.0, 14000, 755.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 755.0,
    capacidade_kg = 14000,
    preco_fixo = 755.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PASSOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2730.0, 14000, 2730.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2730.0,
    capacidade_kg = 14000,
    preco_fixo = 2730.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PEDRO LEOPOLDO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 245.0, 14000, 245.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 245.0,
    capacidade_kg = 14000,
    preco_fixo = 245.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PIRAPORA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1890.0, 14000, 1890.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1890.0,
    capacidade_kg = 14000,
    preco_fixo = 1890.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PITANGUI', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1440.0, 14000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 14000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POMPEU', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1385.0, 14000, 1385.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1385.0,
    capacidade_kg = 14000,
    preco_fixo = 1385.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PONTE NOVA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1850.0, 14000, 1850.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1850.0,
    capacidade_kg = 14000,
    preco_fixo = 1850.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PORTEIRINHA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 3300.0, 14000, 3300.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3300.0,
    capacidade_kg = 14000,
    preco_fixo = 3300.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POUSO ALEGRE', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2760.0, 14000, 2760.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2760.0,
    capacidade_kg = 14000,
    preco_fixo = 2760.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PRUDENTE DE MORAIS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 315.0, 14000, 315.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 315.0,
    capacidade_kg = 14000,
    preco_fixo = 315.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RAPOSOS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 930.0, 14000, 930.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 930.0,
    capacidade_kg = 14000,
    preco_fixo = 930.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIBEIRAO DAS NEVES', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 520.0, 14000, 520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 520.0,
    capacidade_kg = 14000,
    preco_fixo = 520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIO ACIMA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 990.0, 14000, 990.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 990.0,
    capacidade_kg = 14000,
    preco_fixo = 990.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SABARA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 630.0, 14000, 630.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 630.0,
    capacidade_kg = 14000,
    preco_fixo = 630.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTA LUZIA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 440.0, 14000, 440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 440.0,
    capacidade_kg = 14000,
    preco_fixo = 440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DE PIRAPAMA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1000.0, 14000, 1000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1000.0,
    capacidade_kg = 14000,
    preco_fixo = 1000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DO RIACHO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1080.0, 14000, 1080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1080.0,
    capacidade_kg = 14000,
    preco_fixo = 1080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTO ANTONIO DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1405.0, 14000, 1405.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1405.0,
    capacidade_kg = 14000,
    preco_fixo = 1405.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTOS DUMONT', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2000.0, 14000, 2000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2000.0,
    capacidade_kg = 14000,
    preco_fixo = 2000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO BRAS DO SUACUI', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1440.0, 14000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 14000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO GONCALO DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1220.0, 14000, 1220.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1220.0,
    capacidade_kg = 14000,
    preco_fixo = 1220.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOAQUIM DE BICAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 980.0, 14000, 980.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 980.0,
    capacidade_kg = 14000,
    preco_fixo = 980.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DA LAPA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 300.0, 14000, 300.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 300.0,
    capacidade_kg = 14000,
    preco_fixo = 300.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DE ALMEIDA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 575.0, 14000, 575.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 575.0,
    capacidade_kg = 14000,
    preco_fixo = 575.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO SEB D AGUAS CLARAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 755.0, 14000, 755.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 755.0,
    capacidade_kg = 14000,
    preco_fixo = 755.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SARZEDO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 855.0, 14000, 855.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 855.0,
    capacidade_kg = 14000,
    preco_fixo = 855.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SENHORA DO PORTO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1750.0, 14000, 1750.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1750.0,
    capacidade_kg = 14000,
    preco_fixo = 1750.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SERRO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1750.0, 14000, 1750.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1750.0,
    capacidade_kg = 14000,
    preco_fixo = 1750.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SETE LAGOAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 450.0, 14000, 450.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 450.0,
    capacidade_kg = 14000,
    preco_fixo = 450.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('STO ANT DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1405.0, 14000, 1405.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1405.0,
    capacidade_kg = 14000,
    preco_fixo = 1405.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TAQUARACU DE MINAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 855.0, 14000, 855.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 855.0,
    capacidade_kg = 14000,
    preco_fixo = 855.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TEOFILO OTONI', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 2760.0, 14000, 2760.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2760.0,
    capacidade_kg = 14000,
    preco_fixo = 2760.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TRES MARIAS', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 1900.0, 14000, 1900.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1900.0,
    capacidade_kg = 14000,
    preco_fixo = 1900.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERABA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 3120.0, 14000, 3120.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3120.0,
    capacidade_kg = 14000,
    preco_fixo = 3120.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERLANDIA', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 3470.0, 14000, 3470.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3470.0,
    capacidade_kg = 14000,
    preco_fixo = 3470.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('VESPASIANO', 'CIF_SEM_DESCARGA', 'Truck 14t - SEM DESCARGA', 330.0, 14000, 330.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 330.0,
    capacidade_kg = 14000,
    preco_fixo = 330.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ABAETE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1830.0, 14000, 1830.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1830.0,
    capacidade_kg = 14000,
    preco_fixo = 1830.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ALVORADA DE MINAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1730.0, 14000, 1730.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1730.0,
    capacidade_kg = 14000,
    preco_fixo = 1730.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARAÇAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 325.0, 14000, 325.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 325.0,
    capacidade_kg = 14000,
    preco_fixo = 325.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARCOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2080.0, 14000, 2080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2080.0,
    capacidade_kg = 14000,
    preco_fixo = 2080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BARREIRO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 670.0, 14000, 670.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 670.0,
    capacidade_kg = 14000,
    preco_fixo = 670.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BETANIA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 735.0, 14000, 735.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 735.0,
    capacidade_kg = 14000,
    preco_fixo = 735.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CALIFORNIA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 685.0, 14000, 685.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 685.0,
    capacidade_kg = 14000,
    preco_fixo = 685.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CENTRO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 600.0, 14000, 600.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 600.0,
    capacidade_kg = 14000,
    preco_fixo = 600.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - LAGOINHA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 560.0, 14000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 14000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - SAUDADE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 603.0, 14000, 603.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 603.0,
    capacidade_kg = 14000,
    preco_fixo = 603.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - VENDA NOVA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 505.0, 14000, 505.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 505.0,
    capacidade_kg = 14000,
    preco_fixo = 505.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BALDIM', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 835.0, 14000, 835.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 835.0,
    capacidade_kg = 14000,
    preco_fixo = 835.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARAO DE COCAIS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1350.0, 14000, 1350.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1350.0,
    capacidade_kg = 14000,
    preco_fixo = 1350.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARBACENA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1930.0, 14000, 1930.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1930.0,
    capacidade_kg = 14000,
    preco_fixo = 1930.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARROSO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2030.0, 14000, 2030.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2030.0,
    capacidade_kg = 14000,
    preco_fixo = 2030.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BELO VALE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1300.0, 14000, 1300.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1300.0,
    capacidade_kg = 14000,
    preco_fixo = 1300.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BETIM', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 835.0, 14000, 835.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 835.0,
    capacidade_kg = 14000,
    preco_fixo = 835.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BRUMADINHO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1080.0, 14000, 1080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1080.0,
    capacidade_kg = 14000,
    preco_fixo = 1080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CACHOEIRA DA PRATA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 800.0, 14000, 800.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 800.0,
    capacidade_kg = 14000,
    preco_fixo = 800.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETANOPOLIS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 835.0, 14000, 835.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 835.0,
    capacidade_kg = 14000,
    preco_fixo = 835.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1010.0, 14000, 1010.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1010.0,
    capacidade_kg = 14000,
    preco_fixo = 1010.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAMPO BELO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2080.0, 14000, 2080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2080.0,
    capacidade_kg = 14000,
    preco_fixo = 2080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAPIM BRANCO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 325.0, 14000, 325.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 325.0,
    capacidade_kg = 14000,
    preco_fixo = 325.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARANDAI', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1730.0, 14000, 1730.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1730.0,
    capacidade_kg = 14000,
    preco_fixo = 1730.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARDEAL MOTA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 935.0, 14000, 935.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 935.0,
    capacidade_kg = 14000,
    preco_fixo = 935.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARMESIA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2030.0, 14000, 2030.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2030.0,
    capacidade_kg = 14000,
    preco_fixo = 2030.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONCEICAO DO MATO DENTRO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1465.0, 14000, 1465.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1465.0,
    capacidade_kg = 14000,
    preco_fixo = 1465.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONFINS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 325.0, 14000, 325.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 325.0,
    capacidade_kg = 14000,
    preco_fixo = 325.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONGONHAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1350.0, 14000, 1350.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1350.0,
    capacidade_kg = 14000,
    preco_fixo = 1350.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONSELHEIRO LAFAIETE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1490.0, 14000, 1490.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1490.0,
    capacidade_kg = 14000,
    preco_fixo = 1490.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONTAGEM', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 670.0, 14000, 670.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 670.0,
    capacidade_kg = 14000,
    preco_fixo = 670.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORDISBURGO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1065.0, 14000, 1065.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1065.0,
    capacidade_kg = 14000,
    preco_fixo = 1065.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORINTO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1730.0, 14000, 1730.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1730.0,
    capacidade_kg = 14000,
    preco_fixo = 1730.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CURVELO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1465.0, 14000, 1465.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1465.0,
    capacidade_kg = 14000,
    preco_fixo = 1465.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DATAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1980.0, 14000, 1980.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1980.0,
    capacidade_kg = 14000,
    preco_fixo = 1980.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIAMANTINA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2080.0, 14000, 2080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2080.0,
    capacidade_kg = 14000,
    preco_fixo = 2080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIVINOPOLIS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1600.0, 14000, 1600.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1600.0,
    capacidade_kg = 14000,
    preco_fixo = 1600.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DOM JOAQUIM', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1690.0, 14000, 1690.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1690.0,
    capacidade_kg = 14000,
    preco_fixo = 1690.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ENTRE RIOS DE MINAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1690.0, 14000, 1690.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1690.0,
    capacidade_kg = 14000,
    preco_fixo = 1690.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ESMERALDAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 810.0, 14000, 810.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 810.0,
    capacidade_kg = 14000,
    preco_fixo = 810.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FIDALGO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 360.0, 14000, 360.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 360.0,
    capacidade_kg = 14000,
    preco_fixo = 360.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FLORESTAL', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1115.0, 14000, 1115.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1115.0,
    capacidade_kg = 14000,
    preco_fixo = 1115.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORMIGA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1980.0, 14000, 1980.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1980.0,
    capacidade_kg = 14000,
    preco_fixo = 1980.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORTUNA DE MINAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 800.0, 14000, 800.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 800.0,
    capacidade_kg = 14000,
    preco_fixo = 800.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FUNILANDIA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 530.0, 14000, 530.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 530.0,
    capacidade_kg = 14000,
    preco_fixo = 530.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('GUANHAES', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1930.0, 14000, 1930.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1930.0,
    capacidade_kg = 14000,
    preco_fixo = 1930.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IBIRITE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 800.0, 14000, 800.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 800.0,
    capacidade_kg = 14000,
    preco_fixo = 800.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IGARAPE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1070.0, 14000, 1070.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1070.0,
    capacidade_kg = 14000,
    preco_fixo = 1070.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('INHAUMA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1000.0, 14000, 1000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1000.0,
    capacidade_kg = 14000,
    preco_fixo = 1000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IPATINGA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2080.0, 14000, 2080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2080.0,
    capacidade_kg = 14000,
    preco_fixo = 2080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1465.0, 14000, 1465.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1465.0,
    capacidade_kg = 14000,
    preco_fixo = 1465.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRITO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1115.0, 14000, 1115.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1115.0,
    capacidade_kg = 14000,
    preco_fixo = 1115.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAMBE DO MATO DENTRO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAUNA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1310.0, 14000, 1310.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1310.0,
    capacidade_kg = 14000,
    preco_fixo = 1310.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JABOTICATUBAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 735.0, 14000, 735.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 735.0,
    capacidade_kg = 14000,
    preco_fixo = 735.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JECEABA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1600.0, 14000, 1600.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1600.0,
    capacidade_kg = 14000,
    preco_fixo = 1600.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JEQUITIBA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 835.0, 14000, 835.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 835.0,
    capacidade_kg = 14000,
    preco_fixo = 835.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JOAO MONLEVADE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1485.0, 14000, 1485.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1485.0,
    capacidade_kg = 14000,
    preco_fixo = 1485.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JUATUBA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1070.0, 14000, 1070.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1070.0,
    capacidade_kg = 14000,
    preco_fixo = 1070.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LAGOA SANTA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 480.0, 14000, 480.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 480.0,
    capacidade_kg = 14000,
    preco_fixo = 480.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LUZ', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2030.0, 14000, 2030.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2030.0,
    capacidade_kg = 14000,
    preco_fixo = 2030.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIANA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1690.0, 14000, 1690.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1690.0,
    capacidade_kg = 14000,
    preco_fixo = 1690.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIO CAMPOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1010.0, 14000, 1010.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1010.0,
    capacidade_kg = 14000,
    preco_fixo = 1010.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARTINHO CAMPOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1690.0, 14000, 1690.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1690.0,
    capacidade_kg = 14000,
    preco_fixo = 1690.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATEUS LEME', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1115.0, 14000, 1115.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1115.0,
    capacidade_kg = 14000,
    preco_fixo = 1115.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATOZINHOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 325.0, 14000, 325.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 325.0,
    capacidade_kg = 14000,
    preco_fixo = 325.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MOCAMBEIRO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 325.0, 14000, 325.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 325.0,
    capacidade_kg = 14000,
    preco_fixo = 325.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MONTES CLAROS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2440.0, 14000, 2440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2440.0,
    capacidade_kg = 14000,
    preco_fixo = 2440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MORRO DO PILAR', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1310.0, 14000, 1310.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1310.0,
    capacidade_kg = 14000,
    preco_fixo = 1310.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA ERA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1690.0, 14000, 1690.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1690.0,
    capacidade_kg = 14000,
    preco_fixo = 1690.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 935.0, 14000, 935.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 935.0,
    capacidade_kg = 14000,
    preco_fixo = 935.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA - ALPHAVILLE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 935.0, 14000, 935.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 935.0,
    capacidade_kg = 14000,
    preco_fixo = 935.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ONCA DE PITANGUI', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1600.0, 14000, 1600.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1600.0,
    capacidade_kg = 14000,
    preco_fixo = 1600.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO BRANCO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PAPAGAIOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1220.0, 14000, 1220.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1220.0,
    capacidade_kg = 14000,
    preco_fixo = 1220.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARA DE MINAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1310.0, 14000, 1310.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1310.0,
    capacidade_kg = 14000,
    preco_fixo = 1310.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARACATU', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2810.0, 14000, 2810.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2810.0,
    capacidade_kg = 14000,
    preco_fixo = 2810.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARAOPEBA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 835.0, 14000, 835.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 835.0,
    capacidade_kg = 14000,
    preco_fixo = 835.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PASSOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2810.0, 14000, 2810.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2810.0,
    capacidade_kg = 14000,
    preco_fixo = 2810.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PEDRO LEOPOLDO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 325.0, 14000, 325.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 325.0,
    capacidade_kg = 14000,
    preco_fixo = 325.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PIRAPORA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1970.0, 14000, 1970.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1970.0,
    capacidade_kg = 14000,
    preco_fixo = 1970.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PITANGUI', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POMPEU', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1465.0, 14000, 1465.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1465.0,
    capacidade_kg = 14000,
    preco_fixo = 1465.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PONTE NOVA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1930.0, 14000, 1930.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1930.0,
    capacidade_kg = 14000,
    preco_fixo = 1930.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PORTEIRINHA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 3380.0, 14000, 3380.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3380.0,
    capacidade_kg = 14000,
    preco_fixo = 3380.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POUSO ALEGRE', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2840.0, 14000, 2840.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2840.0,
    capacidade_kg = 14000,
    preco_fixo = 2840.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PRUDENTE DE MORAIS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 395.0, 14000, 395.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 395.0,
    capacidade_kg = 14000,
    preco_fixo = 395.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RAPOSOS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1010.0, 14000, 1010.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1010.0,
    capacidade_kg = 14000,
    preco_fixo = 1010.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIBEIRAO DAS NEVES', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 600.0, 14000, 600.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 600.0,
    capacidade_kg = 14000,
    preco_fixo = 600.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIO ACIMA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1070.0, 14000, 1070.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1070.0,
    capacidade_kg = 14000,
    preco_fixo = 1070.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SABARA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 710.0, 14000, 710.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 710.0,
    capacidade_kg = 14000,
    preco_fixo = 710.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTA LUZIA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 520.0, 14000, 520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 520.0,
    capacidade_kg = 14000,
    preco_fixo = 520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DE PIRAPAMA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1080.0, 14000, 1080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1080.0,
    capacidade_kg = 14000,
    preco_fixo = 1080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DO RIACHO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1160.0, 14000, 1160.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1160.0,
    capacidade_kg = 14000,
    preco_fixo = 1160.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTO ANTONIO DO RIO ABAIXO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1485.0, 14000, 1485.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1485.0,
    capacidade_kg = 14000,
    preco_fixo = 1485.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTOS DUMONT', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2080.0, 14000, 2080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2080.0,
    capacidade_kg = 14000,
    preco_fixo = 2080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO BRAS DO SUACUI', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1520.0, 14000, 1520.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1520.0,
    capacidade_kg = 14000,
    preco_fixo = 1520.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO GONCALO DO RIO ABAIXO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1300.0, 14000, 1300.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1300.0,
    capacidade_kg = 14000,
    preco_fixo = 1300.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOAQUIM DE BICAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1060.0, 14000, 1060.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1060.0,
    capacidade_kg = 14000,
    preco_fixo = 1060.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DA LAPA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 380.0, 14000, 380.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 380.0,
    capacidade_kg = 14000,
    preco_fixo = 380.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DE ALMEIDA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 655.0, 14000, 655.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 655.0,
    capacidade_kg = 14000,
    preco_fixo = 655.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO SEB D AGUAS CLARAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 835.0, 14000, 835.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 835.0,
    capacidade_kg = 14000,
    preco_fixo = 835.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SARZEDO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 935.0, 14000, 935.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 935.0,
    capacidade_kg = 14000,
    preco_fixo = 935.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SENHORA DO PORTO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1830.0, 14000, 1830.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1830.0,
    capacidade_kg = 14000,
    preco_fixo = 1830.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SERRO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1830.0, 14000, 1830.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1830.0,
    capacidade_kg = 14000,
    preco_fixo = 1830.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SETE LAGOAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 530.0, 14000, 530.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 530.0,
    capacidade_kg = 14000,
    preco_fixo = 530.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('STO ANT DO RIO ABAIXO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1485.0, 14000, 1485.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1485.0,
    capacidade_kg = 14000,
    preco_fixo = 1485.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TAQUARACU DE MINAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 935.0, 14000, 935.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 935.0,
    capacidade_kg = 14000,
    preco_fixo = 935.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TEOFILO OTONI', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 2840.0, 14000, 2840.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2840.0,
    capacidade_kg = 14000,
    preco_fixo = 2840.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TRES MARIAS', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 1980.0, 14000, 1980.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1980.0,
    capacidade_kg = 14000,
    preco_fixo = 1980.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERABA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 3200.0, 14000, 3200.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3200.0,
    capacidade_kg = 14000,
    preco_fixo = 3200.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERLANDIA', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 3550.0, 14000, 3550.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3550.0,
    capacidade_kg = 14000,
    preco_fixo = 3550.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('VESPASIANO', 'CIF_COM_DESCARGA', 'Truck 14t - COM DESCARGA', 410.0, 14000, 410.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 410.0,
    capacidade_kg = 14000,
    preco_fixo = 410.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ABAETE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1000.0, 8000, 1000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1000.0,
    capacidade_kg = 8000,
    preco_fixo = 1000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ALVORADA DE MINAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 942.8571428571429, 8000, 942.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 942.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 942.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARAÇAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 140.0, 8000, 140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 140.0,
    capacidade_kg = 8000,
    preco_fixo = 140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARCOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1142.857142857143, 8000, 1142.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1142.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1142.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BARREIRO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 337.14285714285717, 8000, 337.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 337.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 337.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BETANIA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 374.2857142857143, 8000, 374.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 374.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 374.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CALIFORNIA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 345.7142857142857, 8000, 345.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 345.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 345.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CENTRO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 297.14285714285717, 8000, 297.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 297.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 297.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - LAGOINHA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 274.2857142857143, 8000, 274.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 274.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 274.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - SAUDADE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 298.85714285714283, 8000, 298.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 298.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 298.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - VENDA NOVA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 242.85714285714286, 8000, 242.85714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 242.85714285714286,
    capacidade_kg = 8000,
    preco_fixo = 242.85714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BALDIM', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 431.42857142857144, 8000, 431.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 431.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 431.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARAO DE COCAIS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 725.7142857142857, 8000, 725.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 725.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 725.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARBACENA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1057.142857142857, 8000, 1057.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1057.142857142857,
    capacidade_kg = 8000,
    preco_fixo = 1057.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARROSO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1114.2857142857142, 8000, 1114.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1114.2857142857142,
    capacidade_kg = 8000,
    preco_fixo = 1114.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BELO VALE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 697.1428571428571, 8000, 697.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 697.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 697.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BETIM', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 431.42857142857144, 8000, 431.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 431.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 431.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BRUMADINHO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 571.4285714285714, 8000, 571.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 571.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 571.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CACHOEIRA DA PRATA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 411.42857142857144, 8000, 411.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 411.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 411.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETANOPOLIS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 431.42857142857144, 8000, 431.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 431.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 431.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 531.4285714285714, 8000, 531.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 531.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 531.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAMPO BELO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1142.857142857143, 8000, 1142.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1142.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1142.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAPIM BRANCO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 140.0, 8000, 140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 140.0,
    capacidade_kg = 8000,
    preco_fixo = 140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARANDAI', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 942.8571428571429, 8000, 942.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 942.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 942.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARDEAL MOTA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 488.57142857142856, 8000, 488.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 488.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 488.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARMESIA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1114.2857142857142, 8000, 1114.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1114.2857142857142,
    capacidade_kg = 8000,
    preco_fixo = 1114.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONCEICAO DO MATO DENTRO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 791.4285714285714, 8000, 791.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 791.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 791.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONFINS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 140.0, 8000, 140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 140.0,
    capacidade_kg = 8000,
    preco_fixo = 140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONGONHAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 725.7142857142857, 8000, 725.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 725.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 725.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONSELHEIRO LAFAIETE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 805.7142857142857, 8000, 805.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 805.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 805.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONTAGEM', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 337.14285714285717, 8000, 337.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 337.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 337.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORDISBURGO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 562.8571428571429, 8000, 562.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 562.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 562.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORINTO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 942.8571428571429, 8000, 942.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 942.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 942.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CURVELO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 791.4285714285714, 8000, 791.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 791.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 791.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DATAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1085.7142857142858, 8000, 1085.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1085.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1085.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIAMANTINA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1142.857142857143, 8000, 1142.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1142.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1142.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIVINOPOLIS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DOM JOAQUIM', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 920.0, 8000, 920.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 920.0,
    capacidade_kg = 8000,
    preco_fixo = 920.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ENTRE RIOS DE MINAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 920.0, 8000, 920.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 920.0,
    capacidade_kg = 8000,
    preco_fixo = 920.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ESMERALDAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 417.14285714285717, 8000, 417.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 417.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 417.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FIDALGO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 160.0, 8000, 160.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 160.0,
    capacidade_kg = 8000,
    preco_fixo = 160.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FLORESTAL', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 591.4285714285714, 8000, 591.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 591.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 591.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORMIGA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1085.7142857142858, 8000, 1085.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1085.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1085.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORTUNA DE MINAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 411.42857142857144, 8000, 411.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 411.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 411.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FUNILANDIA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 257.14285714285717, 8000, 257.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 257.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 257.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('GUANHAES', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1057.142857142857, 8000, 1057.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1057.142857142857,
    capacidade_kg = 8000,
    preco_fixo = 1057.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IBIRITE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 411.42857142857144, 8000, 411.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 411.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 411.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IGARAPE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 565.7142857142857, 8000, 565.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 565.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 565.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('INHAUMA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 525.7142857142857, 8000, 525.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 525.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 525.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IPATINGA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1142.857142857143, 8000, 1142.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1142.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1142.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 791.4285714285714, 8000, 791.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 791.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 791.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRITO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 591.4285714285714, 8000, 591.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 591.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 591.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAMBE DO MATO DENTRO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 822.8571428571429, 8000, 822.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 822.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 822.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAUNA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 702.8571428571429, 8000, 702.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 702.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 702.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JABOTICATUBAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 374.2857142857143, 8000, 374.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 374.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 374.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JECEABA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JEQUITIBA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 431.42857142857144, 8000, 431.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 431.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 431.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JOAO MONLEVADE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 802.8571428571429, 8000, 802.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 802.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 802.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JUATUBA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 565.7142857142857, 8000, 565.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 565.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 565.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LAGOA SANTA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 228.57142857142858, 8000, 228.57142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 228.57142857142858,
    capacidade_kg = 8000,
    preco_fixo = 228.57142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LUZ', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1114.2857142857142, 8000, 1114.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1114.2857142857142,
    capacidade_kg = 8000,
    preco_fixo = 1114.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIANA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 920.0, 8000, 920.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 920.0,
    capacidade_kg = 8000,
    preco_fixo = 920.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIO CAMPOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 531.4285714285714, 8000, 531.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 531.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 531.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARTINHO CAMPOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 920.0, 8000, 920.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 920.0,
    capacidade_kg = 8000,
    preco_fixo = 920.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATEUS LEME', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 591.4285714285714, 8000, 591.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 591.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 591.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATOZINHOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 140.0, 8000, 140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 140.0,
    capacidade_kg = 8000,
    preco_fixo = 140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MOCAMBEIRO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 140.0, 8000, 140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 140.0,
    capacidade_kg = 8000,
    preco_fixo = 140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MONTES CLAROS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1348.5714285714287, 8000, 1348.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1348.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1348.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MORRO DO PILAR', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 702.8571428571429, 8000, 702.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 702.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 702.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA ERA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 920.0, 8000, 920.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 920.0,
    capacidade_kg = 8000,
    preco_fixo = 920.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 488.57142857142856, 8000, 488.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 488.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 488.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA - ALPHAVILLE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 488.57142857142856, 8000, 488.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 488.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 488.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ONCA DE PITANGUI', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO BRANCO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 822.8571428571429, 8000, 822.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 822.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 822.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 822.8571428571429, 8000, 822.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 822.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 822.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 822.8571428571429, 8000, 822.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 822.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 822.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PAPAGAIOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 651.4285714285714, 8000, 651.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 651.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 651.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARA DE MINAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 702.8571428571429, 8000, 702.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 702.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 702.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARACATU', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1560.0, 8000, 1560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1560.0,
    capacidade_kg = 8000,
    preco_fixo = 1560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARAOPEBA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 431.42857142857144, 8000, 431.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 431.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 431.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PASSOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1560.0, 8000, 1560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1560.0,
    capacidade_kg = 8000,
    preco_fixo = 1560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PEDRO LEOPOLDO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 140.0, 8000, 140.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 140.0,
    capacidade_kg = 8000,
    preco_fixo = 140.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PIRAPORA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1080.0, 8000, 1080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1080.0,
    capacidade_kg = 8000,
    preco_fixo = 1080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PITANGUI', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 822.8571428571429, 8000, 822.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 822.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 822.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POMPEU', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 791.4285714285714, 8000, 791.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 791.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 791.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PONTE NOVA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1057.142857142857, 8000, 1057.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1057.142857142857,
    capacidade_kg = 8000,
    preco_fixo = 1057.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PORTEIRINHA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1885.7142857142858, 8000, 1885.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1885.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1885.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POUSO ALEGRE', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1577.142857142857, 8000, 1577.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1577.142857142857,
    capacidade_kg = 8000,
    preco_fixo = 1577.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PRUDENTE DE MORAIS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 180.0, 8000, 180.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 180.0,
    capacidade_kg = 8000,
    preco_fixo = 180.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RAPOSOS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 531.4285714285714, 8000, 531.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 531.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 531.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIBEIRAO DAS NEVES', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 297.14285714285717, 8000, 297.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 297.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 297.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIO ACIMA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 565.7142857142857, 8000, 565.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 565.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 565.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SABARA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 360.0, 8000, 360.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 360.0,
    capacidade_kg = 8000,
    preco_fixo = 360.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTA LUZIA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 251.42857142857142, 8000, 251.42857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 251.42857142857142,
    capacidade_kg = 8000,
    preco_fixo = 251.42857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DE PIRAPAMA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 571.4285714285714, 8000, 571.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 571.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 571.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DO RIACHO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 617.1428571428571, 8000, 617.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 617.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 617.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTO ANTONIO DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 802.8571428571429, 8000, 802.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 802.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 802.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTOS DUMONT', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1142.857142857143, 8000, 1142.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1142.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1142.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO BRAS DO SUACUI', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 822.8571428571429, 8000, 822.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 822.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 822.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO GONCALO DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 697.1428571428571, 8000, 697.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 697.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 697.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOAQUIM DE BICAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 560.0, 8000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 8000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DA LAPA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 171.42857142857142, 8000, 171.42857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 171.42857142857142,
    capacidade_kg = 8000,
    preco_fixo = 171.42857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DE ALMEIDA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 328.57142857142856, 8000, 328.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 328.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 328.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO SEB D AGUAS CLARAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 431.42857142857144, 8000, 431.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 431.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 431.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SARZEDO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 488.57142857142856, 8000, 488.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 488.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 488.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SENHORA DO PORTO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1000.0, 8000, 1000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1000.0,
    capacidade_kg = 8000,
    preco_fixo = 1000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SERRO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1000.0, 8000, 1000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1000.0,
    capacidade_kg = 8000,
    preco_fixo = 1000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SETE LAGOAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 257.14285714285717, 8000, 257.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 257.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 257.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('STO ANT DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 802.8571428571429, 8000, 802.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 802.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 802.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TAQUARACU DE MINAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 488.57142857142856, 8000, 488.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 488.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 488.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TEOFILO OTONI', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1577.142857142857, 8000, 1577.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1577.142857142857,
    capacidade_kg = 8000,
    preco_fixo = 1577.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TRES MARIAS', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1085.7142857142858, 8000, 1085.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1085.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1085.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERABA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1782.857142857143, 8000, 1782.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1782.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1782.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERLANDIA', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 1982.857142857143, 8000, 1982.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1982.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1982.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('VESPASIANO', 'CIF_SEM_DESCARGA', 'Toco 8t - SEM DESCARGA', 188.57142857142858, 8000, 188.57142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 188.57142857142858,
    capacidade_kg = 8000,
    preco_fixo = 188.57142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ABAETE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1080.0, 8000, 1080.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1080.0,
    capacidade_kg = 8000,
    preco_fixo = 1080.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ALVORADA DE MINAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 988.5714285714286, 8000, 988.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 988.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 988.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARAÇAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 185.71428571428572, 8000, 185.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 185.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 185.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARCOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1188.5714285714287, 8000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BARREIRO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 382.85714285714283, 8000, 382.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 382.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 382.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BETANIA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 420.0, 8000, 420.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 420.0,
    capacidade_kg = 8000,
    preco_fixo = 420.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CALIFORNIA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 391.42857142857144, 8000, 391.42857142857144, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 391.42857142857144,
    capacidade_kg = 8000,
    preco_fixo = 391.42857142857144,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CENTRO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 342.85714285714283, 8000, 342.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 342.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 342.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - LAGOINHA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 320.0, 8000, 320.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 320.0,
    capacidade_kg = 8000,
    preco_fixo = 320.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - SAUDADE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 344.57142857142856, 8000, 344.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 344.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 344.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - VENDA NOVA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 288.57142857142856, 8000, 288.57142857142856, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 288.57142857142856,
    capacidade_kg = 8000,
    preco_fixo = 288.57142857142856,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BALDIM', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 477.14285714285717, 8000, 477.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 477.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 477.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARAO DE COCAIS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 771.4285714285714, 8000, 771.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 771.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 771.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARBACENA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1102.857142857143, 8000, 1102.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1102.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1102.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARROSO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1160.0, 8000, 1160.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1160.0,
    capacidade_kg = 8000,
    preco_fixo = 1160.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BELO VALE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 742.8571428571429, 8000, 742.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 742.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 742.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BETIM', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 477.14285714285717, 8000, 477.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 477.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 477.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BRUMADINHO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 617.1428571428571, 8000, 617.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 617.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 617.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CACHOEIRA DA PRATA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 457.14285714285717, 8000, 457.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 457.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 457.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETANOPOLIS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 477.14285714285717, 8000, 477.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 477.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 477.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 577.1428571428571, 8000, 577.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 577.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 577.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAMPO BELO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1188.5714285714287, 8000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAPIM BRANCO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 185.71428571428572, 8000, 185.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 185.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 185.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARANDAI', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 988.5714285714286, 8000, 988.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 988.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 988.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARDEAL MOTA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 534.2857142857143, 8000, 534.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 534.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 534.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARMESIA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1160.0, 8000, 1160.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1160.0,
    capacidade_kg = 8000,
    preco_fixo = 1160.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONCEICAO DO MATO DENTRO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 837.1428571428571, 8000, 837.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 837.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 837.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONFINS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 185.71428571428572, 8000, 185.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 185.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 185.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONGONHAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 771.4285714285714, 8000, 771.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 771.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 771.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONSELHEIRO LAFAIETE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 851.4285714285714, 8000, 851.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 851.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 851.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONTAGEM', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 382.85714285714283, 8000, 382.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 382.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 382.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORDISBURGO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 608.5714285714286, 8000, 608.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 608.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 608.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORINTO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 988.5714285714286, 8000, 988.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 988.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 988.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CURVELO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 837.1428571428571, 8000, 837.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 837.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 837.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DATAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1131.4285714285713, 8000, 1131.4285714285713, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1131.4285714285713,
    capacidade_kg = 8000,
    preco_fixo = 1131.4285714285713,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIAMANTINA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1188.5714285714287, 8000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIVINOPOLIS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 914.2857142857143, 8000, 914.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 914.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 914.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DOM JOAQUIM', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 965.7142857142857, 8000, 965.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 965.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 965.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ENTRE RIOS DE MINAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 965.7142857142857, 8000, 965.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 965.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 965.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ESMERALDAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 462.85714285714283, 8000, 462.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 462.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 462.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FIDALGO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 205.71428571428572, 8000, 205.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 205.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 205.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FLORESTAL', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 637.1428571428571, 8000, 637.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 637.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 637.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORMIGA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1131.4285714285713, 8000, 1131.4285714285713, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1131.4285714285713,
    capacidade_kg = 8000,
    preco_fixo = 1131.4285714285713,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORTUNA DE MINAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 457.14285714285717, 8000, 457.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 457.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 457.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FUNILANDIA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 302.85714285714283, 8000, 302.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 302.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 302.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('GUANHAES', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1102.857142857143, 8000, 1102.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1102.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1102.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IBIRITE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 457.14285714285717, 8000, 457.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 457.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 457.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IGARAPE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 611.4285714285714, 8000, 611.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 611.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 611.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('INHAUMA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 571.4285714285714, 8000, 571.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 571.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 571.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IPATINGA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1188.5714285714287, 8000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 837.1428571428571, 8000, 837.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 837.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 837.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRITO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 637.1428571428571, 8000, 637.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 637.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 637.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAMBE DO MATO DENTRO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAUNA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 748.5714285714286, 8000, 748.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 748.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 748.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JABOTICATUBAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 420.0, 8000, 420.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 420.0,
    capacidade_kg = 8000,
    preco_fixo = 420.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JECEABA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 914.2857142857143, 8000, 914.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 914.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 914.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JEQUITIBA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 477.14285714285717, 8000, 477.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 477.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 477.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JOAO MONLEVADE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 848.5714285714286, 8000, 848.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 848.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 848.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JUATUBA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 611.4285714285714, 8000, 611.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 611.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 611.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LAGOA SANTA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 274.2857142857143, 8000, 274.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 274.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 274.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LUZ', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1160.0, 8000, 1160.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1160.0,
    capacidade_kg = 8000,
    preco_fixo = 1160.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIANA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 965.7142857142857, 8000, 965.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 965.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 965.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIO CAMPOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 577.1428571428571, 8000, 577.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 577.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 577.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARTINHO CAMPOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 965.7142857142857, 8000, 965.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 965.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 965.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATEUS LEME', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 637.1428571428571, 8000, 637.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 637.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 637.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATOZINHOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 185.71428571428572, 8000, 185.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 185.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 185.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MOCAMBEIRO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 185.71428571428572, 8000, 185.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 185.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 185.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MONTES CLAROS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1394.2857142857142, 8000, 1394.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1394.2857142857142,
    capacidade_kg = 8000,
    preco_fixo = 1394.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MORRO DO PILAR', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 748.5714285714286, 8000, 748.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 748.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 748.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA ERA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 965.7142857142857, 8000, 965.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 965.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 965.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 534.2857142857143, 8000, 534.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 534.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 534.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA - ALPHAVILLE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 534.2857142857143, 8000, 534.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 534.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 534.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ONCA DE PITANGUI', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 914.2857142857143, 8000, 914.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 914.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 914.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO BRANCO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PAPAGAIOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 697.1428571428571, 8000, 697.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 697.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 697.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARA DE MINAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 748.5714285714286, 8000, 748.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 748.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 748.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARACATU', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1605.7142857142858, 8000, 1605.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1605.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1605.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARAOPEBA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 477.14285714285717, 8000, 477.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 477.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 477.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PASSOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1605.7142857142858, 8000, 1605.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1605.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1605.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PEDRO LEOPOLDO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 185.71428571428572, 8000, 185.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 185.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 185.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PIRAPORA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1125.7142857142858, 8000, 1125.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1125.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1125.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PITANGUI', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POMPEU', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 837.1428571428571, 8000, 837.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 837.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 837.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PONTE NOVA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1102.857142857143, 8000, 1102.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1102.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1102.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PORTEIRINHA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1931.4285714285713, 8000, 1931.4285714285713, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1931.4285714285713,
    capacidade_kg = 8000,
    preco_fixo = 1931.4285714285713,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POUSO ALEGRE', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1622.857142857143, 8000, 1622.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1622.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1622.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PRUDENTE DE MORAIS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 225.71428571428572, 8000, 225.71428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 225.71428571428572,
    capacidade_kg = 8000,
    preco_fixo = 225.71428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RAPOSOS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 577.1428571428571, 8000, 577.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 577.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 577.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIBEIRAO DAS NEVES', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 342.85714285714283, 8000, 342.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 342.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 342.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIO ACIMA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 611.4285714285714, 8000, 611.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 611.4285714285714,
    capacidade_kg = 8000,
    preco_fixo = 611.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SABARA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 405.7142857142857, 8000, 405.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 405.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 405.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTA LUZIA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 297.14285714285717, 8000, 297.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 297.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 297.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DE PIRAPAMA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 617.1428571428571, 8000, 617.1428571428571, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 617.1428571428571,
    capacidade_kg = 8000,
    preco_fixo = 617.1428571428571,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DO RIACHO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 662.8571428571429, 8000, 662.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 662.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 662.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTO ANTONIO DO RIO ABAIXO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 848.5714285714286, 8000, 848.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 848.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 848.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTOS DUMONT', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1188.5714285714287, 8000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO BRAS DO SUACUI', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 868.5714285714286, 8000, 868.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 868.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 868.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO GONCALO DO RIO ABAIXO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 742.8571428571429, 8000, 742.8571428571429, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 742.8571428571429,
    capacidade_kg = 8000,
    preco_fixo = 742.8571428571429,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOAQUIM DE BICAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 605.7142857142857, 8000, 605.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 605.7142857142857,
    capacidade_kg = 8000,
    preco_fixo = 605.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DA LAPA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 217.14285714285714, 8000, 217.14285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 217.14285714285714,
    capacidade_kg = 8000,
    preco_fixo = 217.14285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DE ALMEIDA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 374.2857142857143, 8000, 374.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 374.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 374.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO SEB D AGUAS CLARAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 477.14285714285717, 8000, 477.14285714285717, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 477.14285714285717,
    capacidade_kg = 8000,
    preco_fixo = 477.14285714285717,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SARZEDO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 534.2857142857143, 8000, 534.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 534.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 534.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SENHORA DO PORTO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1045.7142857142858, 8000, 1045.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1045.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1045.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SERRO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1045.7142857142858, 8000, 1045.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1045.7142857142858,
    capacidade_kg = 8000,
    preco_fixo = 1045.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SETE LAGOAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 302.85714285714283, 8000, 302.85714285714283, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 302.85714285714283,
    capacidade_kg = 8000,
    preco_fixo = 302.85714285714283,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('STO ANT DO RIO ABAIXO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 848.5714285714286, 8000, 848.5714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 848.5714285714286,
    capacidade_kg = 8000,
    preco_fixo = 848.5714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TAQUARACU DE MINAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 534.2857142857143, 8000, 534.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 534.2857142857143,
    capacidade_kg = 8000,
    preco_fixo = 534.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TEOFILO OTONI', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1622.857142857143, 8000, 1622.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1622.857142857143,
    capacidade_kg = 8000,
    preco_fixo = 1622.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TRES MARIAS', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1131.4285714285713, 8000, 1131.4285714285713, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1131.4285714285713,
    capacidade_kg = 8000,
    preco_fixo = 1131.4285714285713,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERABA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 1828.5714285714287, 8000, 1828.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1828.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 1828.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERLANDIA', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 2028.5714285714287, 8000, 2028.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2028.5714285714287,
    capacidade_kg = 8000,
    preco_fixo = 2028.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('VESPASIANO', 'CIF_COM_DESCARGA', 'Toco 8t - COM DESCARGA', 234.28571428571428, 8000, 234.28571428571428, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 234.28571428571428,
    capacidade_kg = 8000,
    preco_fixo = 234.28571428571428,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ABAETE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4000.0, 32000, 4000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4000.0,
    capacidade_kg = 32000,
    preco_fixo = 4000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ALVORADA DE MINAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3771.4285714285716, 32000, 3771.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3771.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3771.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARAÇAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 560.0, 32000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 32000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ARCOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4571.428571428572, 32000, 4571.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4571.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 4571.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BARREIRO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1348.5714285714287, 32000, 1348.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1348.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1348.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - BETANIA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1497.142857142857, 32000, 1497.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1497.142857142857,
    capacidade_kg = 32000,
    preco_fixo = 1497.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CALIFORNIA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1382.857142857143, 32000, 1382.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1382.857142857143,
    capacidade_kg = 32000,
    preco_fixo = 1382.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - CENTRO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1188.5714285714287, 32000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - LAGOINHA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1097.142857142857, 32000, 1097.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1097.142857142857,
    capacidade_kg = 32000,
    preco_fixo = 1097.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - SAUDADE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1195.4285714285713, 32000, 1195.4285714285713, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1195.4285714285713,
    capacidade_kg = 32000,
    preco_fixo = 1195.4285714285713,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('B. HORIZONTE - VENDA NOVA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 971.4285714285714, 32000, 971.4285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 971.4285714285714,
    capacidade_kg = 32000,
    preco_fixo = 971.4285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BALDIM', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1725.7142857142858, 32000, 1725.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1725.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1725.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARAO DE COCAIS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2902.8571428571427, 32000, 2902.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2902.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 2902.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARBACENA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4228.571428571428, 32000, 4228.571428571428, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4228.571428571428,
    capacidade_kg = 32000,
    preco_fixo = 4228.571428571428,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BARROSO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4457.142857142857, 32000, 4457.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4457.142857142857,
    capacidade_kg = 32000,
    preco_fixo = 4457.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BELO VALE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2788.5714285714284, 32000, 2788.5714285714284, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2788.5714285714284,
    capacidade_kg = 32000,
    preco_fixo = 2788.5714285714284,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BETIM', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1725.7142857142858, 32000, 1725.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1725.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1725.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('BRUMADINHO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2285.714285714286, 32000, 2285.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2285.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2285.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CACHOEIRA DA PRATA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1645.7142857142858, 32000, 1645.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1645.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1645.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETANOPOLIS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1725.7142857142858, 32000, 1725.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1725.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1725.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAETE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2125.714285714286, 32000, 2125.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2125.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2125.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAMPO BELO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4571.428571428572, 32000, 4571.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4571.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 4571.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CAPIM BRANCO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 560.0, 32000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 32000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARANDAI', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3771.4285714285716, 32000, 3771.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3771.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3771.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARDEAL MOTA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1954.2857142857142, 32000, 1954.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1954.2857142857142,
    capacidade_kg = 32000,
    preco_fixo = 1954.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CARMESIA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4457.142857142857, 32000, 4457.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4457.142857142857,
    capacidade_kg = 32000,
    preco_fixo = 4457.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONCEICAO DO MATO DENTRO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3165.714285714286, 32000, 3165.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3165.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 3165.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONFINS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 560.0, 32000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 32000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONGONHAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2902.8571428571427, 32000, 2902.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2902.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 2902.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONSELHEIRO LAFAIETE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3222.8571428571427, 32000, 3222.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3222.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 3222.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CONTAGEM', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1348.5714285714287, 32000, 1348.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1348.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1348.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORDISBURGO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2251.4285714285716, 32000, 2251.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2251.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 2251.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CORINTO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3771.4285714285716, 32000, 3771.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3771.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3771.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('CURVELO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3165.714285714286, 32000, 3165.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3165.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 3165.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DATAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4342.857142857143, 32000, 4342.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4342.857142857143,
    capacidade_kg = 32000,
    preco_fixo = 4342.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIAMANTINA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4571.428571428572, 32000, 4571.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4571.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 4571.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DIVINOPOLIS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3474.285714285714, 32000, 3474.285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3474.285714285714,
    capacidade_kg = 32000,
    preco_fixo = 3474.285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('DOM JOAQUIM', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3680.0, 32000, 3680.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3680.0,
    capacidade_kg = 32000,
    preco_fixo = 3680.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ENTRE RIOS DE MINAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3680.0, 32000, 3680.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3680.0,
    capacidade_kg = 32000,
    preco_fixo = 3680.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ESMERALDAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1668.5714285714287, 32000, 1668.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1668.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1668.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FIDALGO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 640.0, 32000, 640.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 640.0,
    capacidade_kg = 32000,
    preco_fixo = 640.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FLORESTAL', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2365.714285714286, 32000, 2365.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2365.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2365.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORMIGA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4342.857142857143, 32000, 4342.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4342.857142857143,
    capacidade_kg = 32000,
    preco_fixo = 4342.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FORTUNA DE MINAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1645.7142857142858, 32000, 1645.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1645.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1645.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('FUNILANDIA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1028.5714285714287, 32000, 1028.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1028.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1028.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('GUANHAES', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4228.571428571428, 32000, 4228.571428571428, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4228.571428571428,
    capacidade_kg = 32000,
    preco_fixo = 4228.571428571428,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IBIRITE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1645.7142857142858, 32000, 1645.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1645.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1645.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IGARAPE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2262.8571428571427, 32000, 2262.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2262.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 2262.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('INHAUMA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2102.8571428571427, 32000, 2102.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2102.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 2102.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('IPATINGA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4571.428571428572, 32000, 4571.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4571.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 4571.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3165.714285714286, 32000, 3165.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3165.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 3165.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITABIRITO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2365.714285714286, 32000, 2365.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2365.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2365.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAMBE DO MATO DENTRO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3291.4285714285716, 32000, 3291.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3291.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3291.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ITAUNA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2811.4285714285716, 32000, 2811.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2811.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 2811.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JABOTICATUBAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1497.142857142857, 32000, 1497.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1497.142857142857,
    capacidade_kg = 32000,
    preco_fixo = 1497.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JECEABA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3474.285714285714, 32000, 3474.285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3474.285714285714,
    capacidade_kg = 32000,
    preco_fixo = 3474.285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JEQUITIBA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1725.7142857142858, 32000, 1725.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1725.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1725.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JOAO MONLEVADE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3211.4285714285716, 32000, 3211.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3211.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3211.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('JUATUBA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2262.8571428571427, 32000, 2262.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2262.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 2262.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LAGOA SANTA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 914.2857142857143, 32000, 914.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 914.2857142857143,
    capacidade_kg = 32000,
    preco_fixo = 914.2857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('LUZ', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4457.142857142857, 32000, 4457.142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4457.142857142857,
    capacidade_kg = 32000,
    preco_fixo = 4457.142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIANA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3680.0, 32000, 3680.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3680.0,
    capacidade_kg = 32000,
    preco_fixo = 3680.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARIO CAMPOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2125.714285714286, 32000, 2125.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2125.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2125.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MARTINHO CAMPOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3680.0, 32000, 3680.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3680.0,
    capacidade_kg = 32000,
    preco_fixo = 3680.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATEUS LEME', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2365.714285714286, 32000, 2365.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2365.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2365.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MATOZINHOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 560.0, 32000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 32000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MOCAMBEIRO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 560.0, 32000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 32000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MONTES CLAROS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 5394.285714285715, 32000, 5394.285714285715, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 5394.285714285715,
    capacidade_kg = 32000,
    preco_fixo = 5394.285714285715,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('MORRO DO PILAR', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2811.4285714285716, 32000, 2811.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2811.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 2811.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA ERA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3680.0, 32000, 3680.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3680.0,
    capacidade_kg = 32000,
    preco_fixo = 3680.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1954.2857142857142, 32000, 1954.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1954.2857142857142,
    capacidade_kg = 32000,
    preco_fixo = 1954.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('NOVA LIMA - ALPHAVILLE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1954.2857142857142, 32000, 1954.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1954.2857142857142,
    capacidade_kg = 32000,
    preco_fixo = 1954.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('ONCA DE PITANGUI', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3474.285714285714, 32000, 3474.285714285714, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3474.285714285714,
    capacidade_kg = 32000,
    preco_fixo = 3474.285714285714,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO BRANCO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3291.4285714285716, 32000, 3291.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3291.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3291.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3291.4285714285716, 32000, 3291.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3291.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3291.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('OURO PRETO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3291.4285714285716, 32000, 3291.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3291.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3291.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PAPAGAIOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2605.714285714286, 32000, 2605.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2605.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2605.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARA DE MINAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2811.4285714285716, 32000, 2811.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2811.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 2811.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARACATU', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 6240.0, 32000, 6240.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 6240.0,
    capacidade_kg = 32000,
    preco_fixo = 6240.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PARAOPEBA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1725.7142857142858, 32000, 1725.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1725.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1725.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PASSOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 6240.0, 32000, 6240.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 6240.0,
    capacidade_kg = 32000,
    preco_fixo = 6240.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PEDRO LEOPOLDO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 560.0, 32000, 560.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 560.0,
    capacidade_kg = 32000,
    preco_fixo = 560.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PIRAPORA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4320.0, 32000, 4320.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4320.0,
    capacidade_kg = 32000,
    preco_fixo = 4320.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PITANGUI', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3291.4285714285716, 32000, 3291.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3291.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3291.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POMPEU', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3165.714285714286, 32000, 3165.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3165.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 3165.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PONTE NOVA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4228.571428571428, 32000, 4228.571428571428, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4228.571428571428,
    capacidade_kg = 32000,
    preco_fixo = 4228.571428571428,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PORTEIRINHA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 7542.857142857143, 32000, 7542.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 7542.857142857143,
    capacidade_kg = 32000,
    preco_fixo = 7542.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('POUSO ALEGRE', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 6308.571428571428, 32000, 6308.571428571428, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 6308.571428571428,
    capacidade_kg = 32000,
    preco_fixo = 6308.571428571428,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('PRUDENTE DE MORAIS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 720.0, 32000, 720.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 720.0,
    capacidade_kg = 32000,
    preco_fixo = 720.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RAPOSOS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2125.714285714286, 32000, 2125.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2125.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2125.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIBEIRAO DAS NEVES', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1188.5714285714287, 32000, 1188.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1188.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1188.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('RIO ACIMA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2262.8571428571427, 32000, 2262.8571428571427, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2262.8571428571427,
    capacidade_kg = 32000,
    preco_fixo = 2262.8571428571427,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SABARA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1440.0, 32000, 1440.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1440.0,
    capacidade_kg = 32000,
    preco_fixo = 1440.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTA LUZIA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1005.7142857142857, 32000, 1005.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1005.7142857142857,
    capacidade_kg = 32000,
    preco_fixo = 1005.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DE PIRAPAMA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2285.714285714286, 32000, 2285.714285714286, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2285.714285714286,
    capacidade_kg = 32000,
    preco_fixo = 2285.714285714286,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTANA DO RIACHO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2468.5714285714284, 32000, 2468.5714285714284, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2468.5714285714284,
    capacidade_kg = 32000,
    preco_fixo = 2468.5714285714284,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTO ANTONIO DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3211.4285714285716, 32000, 3211.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3211.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3211.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SANTOS DUMONT', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4571.428571428572, 32000, 4571.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4571.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 4571.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO BRAS DO SUACUI', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3291.4285714285716, 32000, 3291.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3291.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3291.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO GONCALO DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2788.5714285714284, 32000, 2788.5714285714284, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2788.5714285714284,
    capacidade_kg = 32000,
    preco_fixo = 2788.5714285714284,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOAQUIM DE BICAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 2240.0, 32000, 2240.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 2240.0,
    capacidade_kg = 32000,
    preco_fixo = 2240.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DA LAPA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 685.7142857142857, 32000, 685.7142857142857, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 685.7142857142857,
    capacidade_kg = 32000,
    preco_fixo = 685.7142857142857,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO JOSE DE ALMEIDA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1314.2857142857142, 32000, 1314.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1314.2857142857142,
    capacidade_kg = 32000,
    preco_fixo = 1314.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SAO SEB D AGUAS CLARAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1725.7142857142858, 32000, 1725.7142857142858, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1725.7142857142858,
    capacidade_kg = 32000,
    preco_fixo = 1725.7142857142858,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SARZEDO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1954.2857142857142, 32000, 1954.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1954.2857142857142,
    capacidade_kg = 32000,
    preco_fixo = 1954.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SENHORA DO PORTO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4000.0, 32000, 4000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4000.0,
    capacidade_kg = 32000,
    preco_fixo = 4000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SERRO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4000.0, 32000, 4000.0, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4000.0,
    capacidade_kg = 32000,
    preco_fixo = 4000.0,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('SETE LAGOAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1028.5714285714287, 32000, 1028.5714285714287, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1028.5714285714287,
    capacidade_kg = 32000,
    preco_fixo = 1028.5714285714287,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('STO ANT DO RIO ABAIXO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 3211.4285714285716, 32000, 3211.4285714285716, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 3211.4285714285716,
    capacidade_kg = 32000,
    preco_fixo = 3211.4285714285716,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TAQUARACU DE MINAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 1954.2857142857142, 32000, 1954.2857142857142, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 1954.2857142857142,
    capacidade_kg = 32000,
    preco_fixo = 1954.2857142857142,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TEOFILO OTONI', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 6308.571428571428, 32000, 6308.571428571428, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 6308.571428571428,
    capacidade_kg = 32000,
    preco_fixo = 6308.571428571428,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('TRES MARIAS', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 4342.857142857143, 32000, 4342.857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 4342.857142857143,
    capacidade_kg = 32000,
    preco_fixo = 4342.857142857143,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERABA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 7131.428571428572, 32000, 7131.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 7131.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 7131.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('UBERLANDIA', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 7931.428571428572, 32000, 7931.428571428572, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 7931.428571428572,
    capacidade_kg = 32000,
    preco_fixo = 7931.428571428572,
    ativo = TRUE;

INSERT INTO fretes (cidade, modalidade, tipo_veiculo, preco_por_kg, capacidade_kg, preco_fixo, ativo)
VALUES ('VESPASIANO', 'CIF_SEM_DESCARGA', 'Carreta 32t - SEM DESCARGA', 754.2857142857143, 32000, 754.2857142857143, TRUE)
ON CONFLICT (cidade, modalidade, tipo_veiculo) 
DO UPDATE SET 
    preco_por_kg = 754.2857142857143,
    capacidade_kg = 32000,
    preco_fixo = 754.2857142857143,
    ativo = TRUE;

-- Verificar total
SELECT COUNT(*) as total_fretes FROM fretes WHERE ativo = TRUE;
