package com.example.kafkatls;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;

@SpringBootApplication
public class KafkaTlsSampleApplication {

    private static final String MARKER = "marker-" + UUID.randomUUID();
    private static final CountDownLatch RECEIVED = new CountDownLatch(1);

    public static void main(String[] args) {
        SpringApplication.run(KafkaTlsSampleApplication.class, args);
    }

    @Bean
    CommandLineRunner producer(KafkaTemplate<String, String> template,
                               @Value("${demo.topic}") String topic) {
        return args -> {
            var metadata = template.send(topic, "demo-key", MARKER)
                    .get(30, TimeUnit.SECONDS)
                    .getRecordMetadata();
            System.out.printf("SENT      %s partition=%d offset=%d%n",
                    MARKER, metadata.partition(), metadata.offset());

            if (RECEIVED.await(60, TimeUnit.SECONDS)) {
                System.out.println("ROUND TRIP OK");
                System.exit(0);
            }
            System.out.println("ROUND TRIP TIMED OUT");
            System.exit(1);
        };
    }

    @KafkaListener(topics = "${demo.topic}")
    public void consume(String message) {
        if (MARKER.equals(message)) {
            System.out.println("RECEIVED  " + message);
            RECEIVED.countDown();
        }
    }
}
