import React from 'react';
import { Button } from './Button';
import styles from './ButtonShowcase.module.css';

export const ButtonShowcase: React.FC = () => {
  return (
    <div className={styles.showcase}>
      <h2 className={styles.title}>Button Design System</h2>
      
      {/* Variants */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Variants</h3>
        <div className={styles.buttonGrid}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sizes</h3>
        <div className={styles.buttonGrid}>
          <Button variant="primary" size="xs">Extra Small</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="xl">Extra Large</Button>
        </div>
      </div>

      {/* Real-world Examples */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Real-world Examples</h3>
        <div className={styles.buttonGrid}>
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Edit</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="success">Confirm</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="outline">View</Button>
          <Button variant="ghost">Back</Button>
        </div>
      </div>

      {/* Loading States */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Loading States</h3>
        <div className={styles.buttonGrid}>
          <Button variant="primary" loading>Loading...</Button>
          <Button variant="secondary" loading>Processing</Button>
          <Button variant="danger" loading>Deleting</Button>
        </div>
      </div>

      {/* Disabled States */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Disabled States</h3>
        <div className={styles.buttonGrid}>
          <Button variant="primary" disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>Disabled Secondary</Button>
          <Button variant="danger" disabled>Disabled Danger</Button>
        </div>
      </div>

      {/* Full Width */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Full Width</h3>
        <div className={styles.fullWidthContainer}>
          <Button variant="primary" fullWidth>Full Width Button</Button>
        </div>
      </div>

      {/* Form Actions */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Form Actions</h3>
        <div className={styles.buttonGrid}>
          <Button variant="primary" size="lg">Add New Product</Button>
          <Button variant="secondary">Edit Product</Button>
          <Button variant="outline">View Details</Button>
          <Button variant="danger" size="sm">Delete</Button>
          <Button variant="ghost" size="sm">Back to List</Button>
          <Button variant="success" loading>Saving Changes...</Button>
        </div>
      </div>
    </div>
  );
};
