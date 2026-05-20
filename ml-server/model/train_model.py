"""
Purpose: Build and train a CNN for food classification using transfer learning with MobileNetV2.
Inputs: Food-101 dataset (via TensorFlow Datasets).
Outputs: Trained model (food_model.h5) and class labels (class_labels.json).
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
import tensorflow_datasets as tfds
import json
import os

def build_model(num_classes):
    # Base model: MobileNetV2 pretrained on ImageNet
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base model layers initially

    model = models.Sequential([
        # Data Augmentation
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.Rescaling(1./255),
        
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.4),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model, base_model

def train():
    # Load dataset
    (train_ds, val_ds), ds_info = tfds.load(
        'food101',
        split=['train', 'validation'],
        shuffle_files=True,
        as_supervised=True,
        with_info=True,
    )
    
    num_classes = ds_info.features['label'].num_classes
    class_names = ds_info.features['label'].names
    
    # Save class labels
    with open('../model/class_labels.json', 'w') as f:
        json.dump(class_names, f)

    # Preprocess
    def preprocess(image, label):
        image = tf.image.resize(image, (224, 224))
        return image, tf.one_hot(label, num_classes)

    train_ds = train_ds.map(preprocess).batch(32).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(preprocess).batch(32).prefetch(tf.data.AUTOTUNE)

    model, base_model = build_model(num_classes)

    # Phase 1: Frozen Base
    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks = [
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3),
        tf.keras.callbacks.ModelCheckpoint('../model/food_model.h5', save_best_only=True)
    ]

    print("Starting Phase 1: Training custom head...")
    model.fit(train_ds, validation_data=val_ds, epochs=10, callbacks=callbacks)

    # Phase 2: Fine-tuning
    print("Starting Phase 2: Fine-tuning last 30 layers...")
    base_model.trainable = True
    # Freeze all layers except the last 30
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.fit(train_ds, validation_data=val_ds, epochs=10, callbacks=callbacks)
    
    print("Training complete. Model saved to ../model/food_model.h5")

if __name__ == "__main__":
    train()
