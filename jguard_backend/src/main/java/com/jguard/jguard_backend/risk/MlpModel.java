package com.jguard.jguard_backend.risk;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * ml/train_risk_model.py로 학습한 MLP 가중치(JSON)를 로드해 순전파 추론을 수행한다.
 * 은닉층 ReLU, 출력층 Sigmoid.
 */
@Component
public class MlpModel {

    private static final String MODEL_PATH = "model/risk_mlp.json";

    private double[] scalerMean;
    private double[] scalerStd;
    private final List<double[][]> weights = new ArrayList<>();
    private final List<double[]> biases = new ArrayList<>();
    private double testAccuracy;

    @PostConstruct
    void load() throws IOException {
        try (InputStream in = new ClassPathResource(MODEL_PATH).getInputStream()) {
            JsonNode root = new ObjectMapper().readTree(in);

            scalerMean = toArray(root.path("scaler").path("mean"));
            scalerStd = toArray(root.path("scaler").path("std"));
            testAccuracy = root.path("metrics").path("test_accuracy").asDouble();

            for (JsonNode layer : root.path("layers")) {
                JsonNode w = layer.path("weights");
                double[][] matrix = new double[w.size()][];
                for (int i = 0; i < w.size(); i++) {
                    matrix[i] = toArray(w.get(i));
                }
                weights.add(matrix);
                biases.add(toArray(layer.path("biases")));
            }
        }
    }

    /** 원본 피처 벡터를 받아 위험 확률(0~1)을 반환한다. */
    public double predict(double[] features) {
        double[] a = new double[features.length];
        for (int i = 0; i < features.length; i++) {
            a[i] = (features[i] - scalerMean[i]) / scalerStd[i];
        }

        for (int layer = 0; layer < weights.size(); layer++) {
            double[][] w = weights.get(layer);
            double[] b = biases.get(layer);
            double[] out = new double[b.length];
            for (int j = 0; j < b.length; j++) {
                double sum = b[j];
                for (int i = 0; i < w.length; i++) {
                    sum += a[i] * w[i][j];
                }
                boolean isOutput = layer == weights.size() - 1;
                out[j] = isOutput ? sigmoid(sum) : Math.max(0.0, sum);
            }
            a = out;
        }
        return a[0];
    }

    public double getTestAccuracy() {
        return testAccuracy;
    }

    private double sigmoid(double x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }

    private double[] toArray(JsonNode node) {
        double[] arr = new double[node.size()];
        for (int i = 0; i < node.size(); i++) {
            arr[i] = node.get(i).asDouble();
        }
        return arr;
    }
}
